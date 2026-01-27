import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
            rejectUnauthorized: false, // 2026 tarih hatasını burada aşıyoruz
        }),
    }),
    forcePathStyle: true,
});

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
        });

        const { Body, ContentType } = await r2Client.send(command);

        if (!Body) {
            return new NextResponse('Image not found', { status: 404 });
        }

        // Dosyayı tarayıcıya ilet
        const stream = Body as any;
        return new NextResponse(stream, {
            headers: {
                'Content-Type': ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Proxy Hatası:', error);
        return new NextResponse('Error loading image', { status: 500 });
    }
}
