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

export async function getUnusedImagesAction() {
    try {
        // 1. R2'den tüm dosyaları çek
        const r2Files = await listR2Files();

        // 2. DB'den tüm hadisleri çek (Resim URL'lerini toplamak için)
        // Not: Tüm hadisleri çekiyoruz çünkü sayı muhtemelen çok fazla değil (1000'den az)
        const { data: allHadiths } = await hadithService.getHadiths({ pageSize: 1000, includeDrafts: true });

        const usedImageUrls = new Set(
            allHadiths
                .map(h => h.resimUrl)
                .filter(url => !!url)
                .map(url => {
                    // URL'den sadece dosya adını çek (örn: ...)
                    try {
                        const parts = url!.split('/');
                        return parts[parts.length - 1];
                    } catch {
                        return null;
                    }
                })
        );

        // 3. Kullanılmayanları filtrele
        const unusedFiles = r2Files.filter(file => !usedImageUrls.has(file.key));

        return {
            success: true,
            unusedFiles: unusedFiles.map(f => ({
                key: f.key,
                size: f.size,
                lastModified: f.lastModified,
                url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${f.key}`
            }))
        };
    } catch (error: any) {
        console.error('Check Unused Images Error:', error);
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
