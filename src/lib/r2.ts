import { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";

// Cloudflare R2 Client - Vercel ve Lokal uyumluluğu için güçlendirildi
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
            // Vercel veya Lokal ağındaki SSL (Handshake 40) hatalarını aşmak için
            rejectUnauthorized: false,
        }),
    }),
    forcePathStyle: true,
});

export async function checkFileExists(fileName: string): Promise<string | null> {
    try {
        await r2Client.send(
            new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
            })
        );
        const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
        return `${baseUrl}/${fileName}`;
    } catch (err: any) {
        return null;
    }
}

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
        console.error("R2 Upload Error Detail:", err);
        throw new Error(`R2 Yükleme Hatası (SSL Check: Disabled): ${err.message}`);
    }
}

export async function listR2Files(): Promise<{ key: string; size: number; lastModified?: Date }[]> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
        });

        const response = await r2Client.send(command);
        return (response.Contents || []).map(item => ({
            key: item.Key || "",
            size: item.Size || 0,
            lastModified: item.LastModified
        }));
    } catch (err: any) {
        console.error("R2 List Error:", err);
        throw new Error(`R2 Listeleme Hatası: ${err.message}`);
    }
}

export async function deleteFromR2(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (err: any) {
        console.error("R2 Delete Error:", err);
        throw new Error(`R2 Silme Hatası: ${err.message}`);
    }
}
