import sqlite3
import os
import time
import sys
import translators as ts
from concurrent.futures import ThreadPoolExecutor, as_completed

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')

def clean_text(text):
    if not text:
        return ""
    return text.replace('\ufdfa', '(sav)').replace('ﷺ', '(sav)').strip()

def translate_hadith(text):
    text = clean_text(text)
    if not text:
        return ""
    
    engines = ['google', 'bing']
    for engine in engines:
        try:
            if len(text) > 1800:
                chunks = [text[i:i+1800] for i in range(0, len(text), 1800)]
                translated_parts = []
                for chunk in chunks:
                    res = ts.translate_text(chunk, translator=engine, from_language='en', to_language='tr')
                    translated_parts.append(res)
                    time.sleep(0.1)
                return " ".join(translated_parts)
            else:
                res = ts.translate_text(text, translator=engine, from_language='en', to_language='tr')
                if res and res != text:
                    return res
        except Exception:
            time.sleep(0.3)
            continue
            
    return None

def worker(row):
    raw_ref_key, english_text = row
    tr_text = translate_hadith(english_text)
    return raw_ref_key, tr_text, english_text

def run():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM sahih_bukhari WHERE turkce_text IS NOT NULL AND turkce_text != '' AND turkce_text != english_text")
    already_done = cursor.fetchone()[0]
    
    cursor.execute("SELECT raw_ref_key, english_text FROM sahih_bukhari WHERE turkce_text IS NULL OR turkce_text = '' OR turkce_text = english_text")
    rows = cursor.fetchall()
    
    total_remaining = len(rows)
    print(f"Zaten çevrilmiş: {already_done}. Kalan çevrilecek: {total_remaining}", flush=True)
    
    completed = already_done
    batch_size = 20
    
    for i in range(0, total_remaining, batch_size):
        batch = rows[i:i+batch_size]
        updates = []
        
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(worker, r) for r in batch]
            for future in as_completed(futures):
                try:
                    ref_key, tr_text, orig_en = future.result()
                    if tr_text and tr_text != orig_en:
                        updates.append((tr_text, ref_key))
                except Exception:
                    pass
        
        if updates:
            cursor.executemany("UPDATE sahih_bukhari SET turkce_text = ? WHERE raw_ref_key = ?", updates)
            conn.commit()
            completed += len(updates)
            print(f"İlerleme: {completed} / 7580 hadis Türkçe'ye çevrildi ve veritabanına kaydedildi.", flush=True)
        
        time.sleep(0.1)
        
    conn.close()
    print("Tüm çeviri işlemi başarıyla tamamlandı!", flush=True)

if __name__ == '__main__':
    run()
