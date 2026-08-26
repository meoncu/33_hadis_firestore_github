import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, serverTimestamp, collection, getDocs, limit, query } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: "AIzaSyDugYyvOGeLZgbBVNvfrkslYGqsT4O1CnM",
    authDomain: "hadis-19a1a.firebaseapp.com",
    projectId: "hadis-19a1a",
    storageBucket: "hadis-19a1a.firebasestorage.app",
    messagingSenderId: "578394345609",
    appId: "1:578394345609:web:78f787ff44b34efba03658",
    measurementId: "G-D74BJ45BTN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importHadiths() {
    const jsonPath = path.join(__dirname, 'hadiths_export.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const hadiths = JSON.parse(rawData);

    console.log(`Toplam ${hadiths.length} hadis Firestore'a aktarılmaya başlanıyor...`);

    const BATCH_SIZE = 400; // Firestore limit 500
    let totalImported = 0;

    for (let i = 0; i < hadiths.length; i += BATCH_SIZE) {
        const chunk = hadiths.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        for (const item of chunk) {
            // Document ID siraNo ile eşleşecek (Örn: bukhari_1, bukhari_2)
            const docRef = doc(db, "hadiths", `bukhari_${item.siraNo}`);
            batch.set(docRef, {
                ...item,
                eklemeTarihi: serverTimestamp()
            }, { merge: true });
        }

        await batch.commit();
        totalImported += chunk.length;
        console.log(`İlerleme: ${totalImported} / ${hadiths.length} hadis Firestore'a aktarıldı ve kaydedildi.`);
    }

    console.log("🔥 Tüm 7.580 hadis Firestore veritabanına başarıyla yüklendi!");
    process.exit(0);
}

importHadiths().catch(err => {
    console.error("Aktarım hatası:", err);
    process.exit(1);
});
