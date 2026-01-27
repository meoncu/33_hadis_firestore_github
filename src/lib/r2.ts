import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 SSL ve Bağlantı sorunlarını aşmak için en uyumlu ayarlar
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // Sertifika hatalarını önlemek için R2'de bu true olmalıdır
});

export async function uploadToR2(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    try {
        await r2Client.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            })
        );

        const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
        return `${baseUrl}/${fileName}`;
    } catch (err: any) {
        console.error("R2 Detaylı Hata:", err);
        // Hata mesajını daha okunur kılalım
        if (err.message.includes("SSL")) {
            throw new Error("GÜVENLİK HATASI: Bilgisayarınızın tarih ve saati yanlış olabilir. Lütfen kontrol edin.");
        }
        throw new Error(`Yükleme Başarısız: ${err.message}`);
    }
}
