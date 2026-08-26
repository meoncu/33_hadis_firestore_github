import sqlite3
import os
import re

db_path = os.path.join(os.path.dirname(__file__), 'bukhari_hadith_db_with_reference.db')

def clean_turkish_sentence(text):
    if not text:
        return ""
    
    # 1. Parantez ve Salavat İkilemelerini Düzelt
    text = re.sub(r'\(\s*\(\s*sav\s*\)\s*\)', '(sav)', text, flags=re.IGNORECASE)
    text = re.sub(r'\(\s*sav\s*\)\s*\(\s*sav\s*\)', '(sav)', text, flags=re.IGNORECASE)
    text = re.sub(r'\(\s*\(\s*pbuh\s*\)\s*\)', '(sav)', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(pbuh|p\.b\.u\.h)\b', '(sav)', text, flags=re.IGNORECASE)
    text = text.replace('(sav) (sav)', '(sav)')
    
    # 2. Noktalama İşaretleri Önündeki Boşlukları Temizle
    text = re.sub(r'\s+([.,!?:;])', r'\1', text)
    
    # 3. Parantez İçi Boşlukları Düzelt
    text = re.sub(r'\(\s+', '(', text)
    text = re.sub(r'\s+\)', ')', text)
    text = re.sub(r'\[\s+', '[', text)
    text = re.sub(r'\s+\]', ']', text)
    
    # 4. Çift ve Çoklu Boşlukları Tek Boşluğa Düşür
    text = re.sub(r'[ \t]+', ' ', text)
    
    # 5. Baş ve Son Boşluklarını Temizle
    return text.strip()

def run_analysis_and_clean():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT raw_ref_key, turkce_text FROM sahih_bukhari WHERE turkce_text IS NOT NULL AND turkce_text != ''")
    rows = cursor.fetchall()
    
    total = len(rows)
    print(f"Toplam {total} Türkçe metin inceleniyor...")
    
    fixed_count = 0
    updates = []
    issues_found = []
    
    for ref_key, original_text in rows:
        cleaned_text = clean_turkish_sentence(original_text)
        
        # Tipik anlatım bozukluğu / yarım kalma tespiti
        # 1. İngilizce kelime kalıntıları tespiti
        eng_words = re.findall(r'\b(the|and|of|in|to|with|that|he|was|said|prophet|messenger|allah|upon|him|be|peace)\b', cleaned_text, flags=re.IGNORECASE)
        if len(eng_words) > 3:
            issues_found.append((ref_key, "Kısmi İngilizce Kelimeler", cleaned_text[:100]))
            
        if cleaned_text != original_text:
            updates.append((cleaned_text, ref_key))
            fixed_count += 1
            
    if updates:
        cursor.executemany("UPDATE sahih_bukhari SET turkce_text = ? WHERE raw_ref_key = ?", updates)
        conn.commit()
        print(f"Otomatik Düzeltilen Metin Sayısı: {fixed_count} satır (Parantez, Çift Salavat, Noktalama ve Boşluk Düzeltmeleri).")
    else:
        print("Tüm metinler biçimsel olarak temiz.")
        
    print(f"Kısmi veya Olası İngilizce Kalıntısı İçeren Satır Sayısı: {len(issues_found)}")
    if issues_found:
        print("Örnek Uyarı Verilen Satırlar:")
        for ref_key, reason, sample in issues_found[:5]:
            print(f"  Hadis #{ref_key} [{reason}]: {sample}...")
            
    conn.close()

if __name__ == '__main__':
    run_analysis_and_clean()
