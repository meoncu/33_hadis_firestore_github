import sqlite3
import json
import os
import gzip

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')
json_path = os.path.join(os.path.dirname(__file__), 'hadiths_export.json')
gz_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'hadiths_export.json.gz')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
    SELECT raw_ref_key, book_num, local_num, title, narrator, english_text, arabic_text, turkce_text, in_book_reference
    FROM sahih_bukhari
""")

rows = cursor.fetchall()

def determine_category(title, text):
    title_lower = (title or "").lower()
    
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

for idx, row in enumerate(rows, start=1):
    raw_ref_key, book_num, local_num, title, narrator, english_text, arabic_text, turkce_text, in_book_ref = row
    
    metin = (turkce_text or english_text or "").strip()
    metin_arapca = (arabic_text or "").strip()
    ravi = (narrator or "").strip()
    
    chapter_title = (title or "").strip()
    kaynak = f"Sahih-i Buhari, {chapter_title} (Hadis #{idx})" if chapter_title else f"Sahih-i Buhari, Hadis #{idx}"
    
    category = determine_category(chapter_title, metin)

    item = {
        "siraNo": idx, # Kesintisiz 1, 2, 3... 7580 sıralaması
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

# JSON olarak kaydet
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, indent=2)

# Gzip sıkıştırarak src/lib/ içine kaydet
with open(json_path, 'rb') as f_in:
    with gzip.open(gz_path, 'wb') as f_out:
        f_out.writelines(f_in)

print(f"Tüm {len(export_data)} hadis kesintisiz 1-{len(export_data)} sıra numaraları ile güncellendi ve {gz_path} konumuna kaydedildi.")
conn.close()
