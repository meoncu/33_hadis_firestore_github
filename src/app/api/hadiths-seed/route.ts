import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '1000', 10);

        const gzPath = path.join(process.cwd(), 'src', 'lib', 'hadiths_export.json.gz');
        const jsonPath = path.join(process.cwd(), 'src', 'lib', 'hadiths_export.json');

        let rawBuffer: Buffer;
        if (fs.existsSync(gzPath)) {
            const compressedBuffer = fs.readFileSync(gzPath);
            rawBuffer = zlib.gunzipSync(compressedBuffer);
        } else if (fs.existsSync(jsonPath)) {
            rawBuffer = fs.readFileSync(jsonPath);
        } else {
            return NextResponse.json({ error: 'Export seed file not found' }, { status: 404 });
        }

        const allHadiths = JSON.parse(rawBuffer.toString('utf-8'));
        const total = allHadiths.length;

        // Sayfalama (Paginated delivery to keep Vercel responses fast and light)
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const chunkData = allHadiths.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: chunkData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
