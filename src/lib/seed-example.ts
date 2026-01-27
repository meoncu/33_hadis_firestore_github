/**
 * Örnek Seed Verisi (Firestore'a manuel veya script ile eklenebilir)
 */

/*
Collection: hadiths
Document ID: auto-generated

Data:
{
  "metin": "Sizin en hayırlınız, ahlakı en güzel olanınızdır.",
  "ravi": "Abdullah ibn Amr",
  "kaynak": "Buhari, Menakıb 23",
  "kategori": "Ahlak",
  "etiketler": ["ahlak", "hayırlı", "insan"],
  "eklemeTarihi": { "seconds": 1709289600, "nanoseconds": 0 }, // Örn timestamp
  "dil": "TR",
  "resimDurumu": "none",
  "yayinDurumu": "published",
  "goruntulenme": 150,
  "likeSayisi": 42
}
*/

export const sampleHadiths = [
    {
        metin: "Temizlik imanın yarısıdır.",
        ravi: "Ebu Malik el-Eş'ari",
        kaynak: "Müslim, Taharet 1",
        kategori: "İbadet",
        etiketler: ["temizlik", "iman"],
        dil: "TR",
        resimDurumu: "none",
        yayinDurumu: "published"
    },
    {
        metin: "Güzel söz sadakadır.",
        ravi: "Ebu Hureyre",
        kaynak: "Buhari, Cihad 128",
        kategori: "Ahlak",
        etiketler: ["sadaka", "dil"],
        dil: "TR",
        resimDurumu: "none",
        yayinDurumu: "published"
    }
];
