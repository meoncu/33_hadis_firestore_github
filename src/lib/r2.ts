import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 için en stabil ayarlar
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    // Bazı Node.js sürümlerinde SSL 40 hatasını çözen ayarlar
    forcePathStyle: false, // Cloudflare R2 için false (virtual-host) daha iyidir
});

export async function uploadToR2(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
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

        // Public URL temizleme
        const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
        return `${baseUrl}/${fileName}`;
    } catch (err: any) {
        console.error("R2 Upload Error detail:", err);
        throw new Error(`R2 Yükleme Hatası: ${err.message}`);
    }
}
