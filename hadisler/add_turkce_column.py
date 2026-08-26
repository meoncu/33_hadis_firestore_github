import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# PRAGMA check for turkce_text column
cursor.execute("PRAGMA table_info(sahih_bukhari);")
columns = [col[1] for col in cursor.fetchall()]

print("Mevcut Kolonlar:", columns)

if 'turkce_text' not in columns:
    print("'turkce_text' kolonu ekleniyor...")
    cursor.execute("ALTER TABLE sahih_bukhari ADD COLUMN turkce_text TEXT;")
    conn.commit()
    print("'turkce_text' kolonu başarıyla eklendi!")
else:
    print("'turkce_text' kolonu zaten mevcut.")

cursor.execute("SELECT COUNT(*) FROM sahih_bukhari WHERE turkce_text IS NOT NULL AND turkce_text != ''")
translated_count = cursor.fetchone()[0]
print(f"Çevrilmiş Hadis Sayısı: {translated_count} / 7580")

conn.close()
