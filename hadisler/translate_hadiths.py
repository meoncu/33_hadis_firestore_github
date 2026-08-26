import sqlite3
import os
import time
import urllib.request
import urllib.parse
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')

def translate_text(text):
    if not text or not text.strip():
        return ""
    
    # 1. Try googleapis free endpoint
    try:
        # Split text into chunks if too long (> 2000 chars)
        chunks = [text[i:i+1800] for i in range(0, len(text), 1800)]
        translated_chunks = []
        
        for chunk in chunks:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q={urllib.parse.quote(chunk)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                translated_chunks.append(''.join([item[0] for item in data[0] if item and item[0]]))
            time.sleep(0.1)
            
        return ' '.join(translated_chunks)
    except Exception as e:
        # Fallback to translators or deep_translator
        try:
            import translators as ts
            return ts.translate_text(text[:2000], translator='bing', from_language='en', to_language='tr')
        except Exception:
            try:
                from deep_translator import MyMemoryTranslator
                return MyMemoryTranslator(source='en', target='tr').translate(text[:500])
            except Exception:
                return text # Return original if all fail

def worker(row):
    raw_ref_key, english_text = row
    tr_text = translate_text(english_text)
    return raw_ref_key, tr_text

def run_translation_batch():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get rows needing translation
    cursor.execute("SELECT raw_ref_key, english_text FROM sahih_bukhari WHERE turkce_text IS NULL OR turkce_text = ''")
    rows = cursor.fetchall()
    
    total = len(rows)
    print(f"Translating {total} hadiths...")
    
    batch_size = 50
    completed = 0
    
    for i in range(0, total, batch_size):
        batch = rows[i:i+batch_size]
        updates = []
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_row = {executor.submit(worker, r): r for r in batch}
            for future in as_completed(future_to_row):
                try:
                    ref_key, tr_text = future.result()
                    if tr_text:
                        updates.append((tr_text, ref_key))
                except Exception as err:
                    pass
        
        if updates:
            cursor.executemany("UPDATE sahih_bukhari SET turkce_text = ? WHERE raw_ref_key = ?", updates)
            conn.commit()
            completed += len(updates)
            print(f"Progress: {completed} / {total} translated and saved to DB.")
        
        time.sleep(0.5)

    conn.close()
    print("Translation batch complete!")

if __name__ == '__main__':
    run_translation_batch()
