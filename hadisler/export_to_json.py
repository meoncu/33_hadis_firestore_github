import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')
json_path = os.path.join(os.path.dirname(__file__), 'hadiths_export.json')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
    SELECT raw_ref_key, book_num, local_num, title, narrator, english_text, arabic_text, turkce_text, in_book_reference
    FROM sahih_bukhari
""")

rows = cursor.fetchall()

def determine_category(title, text):
    title_lower = (title or "").lower()
    text_lower = (text or "").lower()
    
    if any(k in title_lower for k in ['faith', 'belief', 'tauheed', 'iman']):
        return 'İman'
    elif any(k in title_lower for k in ['prayer', 'ablution', 'fasting', 'zakat', 'hajj', 'ibadat', 'salah', 'namaz', 'oruc', 'hac', 'abdest']):
        return 'İbadet'
    elif any(k in title_lower for k in ['invocation', 'supplication', 'dua', 'dhikr', 'remembrance']):
        return 'Dua'
    elif any(k in title_lower for k in ['good manners', 'character', 'morals', 'ethics', 'adab', 'ahlak']):
        return 'Ahlak'
    elif any(k in title_lower for k in ['sales', 'trade', 'marriage', 'divorce', 'family', 'social', 'society', 'muamalat']):
        return 'Sosyal Hayat'
    else:
        return 'Diğer'

export_data = []

for row in rows:
    raw_ref_key, book_num, local_num, title, narrator, english_text, arabic_text, turkce_text, in_book_ref = row
    
    # Metin seçimi: Öncelik Türkçe metin, yoksa İngilizce metin
    metin = (turkce_text or english_text or "").strip()
    metin_arapca = (arabic_text or "").strip()
    ravi = (narrator or "").strip()
    
    chapter_title = (title or "").strip()
    kaynak = f"Sahih-i Buhari, {chapter_title} (Hadis #{local_num or raw_ref_key})" if chapter_title else f"Sahih-i Buhari, Hadis #{raw_ref_key}"
    
    category = determine_category(chapter_title, metin)
    
    try:
        sira_no = int(raw_ref_key)
    except Exception:
        sira_no = 0

    item = {
        "siraNo": sira_no,
        "metin": metin,
        "metinArapca": metin_arapca,
        "ravi": ravi,
        "kaynak": kaynak,
        "kategori": category,
        "etiketler": ["buhari", "sahih", category.lower()],
        "dil": "TR",
        "resimDurumu": "none",
        "yayinDurumu": "published",
        "goruntulenme": 0,
        "likeSayisi": 0
    }
    export_data.append(item)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, indent=2)

print(f"Toplam {len(export_data)} hadis {json_path} dosyasına aktarıldı.")
conn.close()
