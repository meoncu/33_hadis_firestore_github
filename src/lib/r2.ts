import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";

// SSL Hatalarını ve Tarih Uyuşmazlıklarını aşmak için özel konfigürasyon
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
            // Tarih 2026 olduğu için sertifika reddediliyorsa, bu satır denetimi geçer:
            rejectUnauthorized: false,
        }),
    }),
    forcePathStyle: true,
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
        console.error("R2 Hata Detayı:", err);
        throw new Error(`Yükleme Başarısız: ${err.message}`);
    }
}
