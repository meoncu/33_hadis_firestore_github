'use server';

import { uploadToR2, checkFileExists, listR2Files, deleteFromR2 } from "@/lib/r2";
import { hadithService } from "@/services/firestore";

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    try {
        // Kontrol: Aynı isimde dosya zaten var mı?
        const existingUrl = await checkFileExists(file.name.replace(/\s+/g, "-"));
        if (existingUrl) {
            return {
                success: true,
                url: existingUrl,
                alreadyExists: true
            };
        }

        const url = await uploadToR2(file);
        return { success: true, url };
    } catch (error: any) {
        console.error('R2 Upload Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getMediaAnalysisAction() {
    try {
        // 1. R2'den tüm dosyaları çek
        const r2Files = await listR2Files();

        // 2. DB'den tüm hadisleri çek
        const { data: allHadiths } = await hadithService.getHadiths({ pageSize: 1000, includeDrafts: true });

        // Resim bazlı bir eşleştirme haritası oluştur
        const usageMap = new Map<string, { id: string; siraNo?: number }[]>();

        allHadiths.forEach(h => {
            if (h.resimUrl) {
                try {
                    const parts = h.resimUrl.split('/');
                    const fileName = parts[parts.length - 1];
                    if (!usageMap.has(fileName)) {
                        usageMap.set(fileName, []);
                    }
                    usageMap.get(fileName)!.push({ id: h.id!, siraNo: h.siraNo });
                } catch { }
            }
        });

        // 3. Tüm dosyaları analiz et
        const analyzedFiles = r2Files.map(file => {
            const linkedHadiths = usageMap.get(file.key) || [];
            return {
                key: file.key,
                size: file.size,
                lastModified: file.lastModified,
                url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file.key}`,
                isUsed: linkedHadiths.length > 0,
                linkedHadiths // [{id, siraNo}, ...]
            };
        });

        // Kullanılmayanlar önce gelsin diye sıralayabiliriz
        analyzedFiles.sort((a, b) => (a.isUsed === b.isUsed ? 0 : a.isUsed ? 1 : -1));

        return {
            success: true,
            files: analyzedFiles
        };
    } catch (error: any) {
        console.error('Media Analysis Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteImageAction(key: string) {
    try {
        await deleteFromR2(key);
        return { success: true };
    } catch (error: any) {
        console.error('Delete Image Error:', error);
        return { success: false, error: error.message };
    }
}
