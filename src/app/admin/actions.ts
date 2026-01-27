'use server';

import { uploadToR2 } from "@/lib/r2";

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    try {
        const url = await uploadToR2(file);
        return { success: true, url };
    } catch (error: any) {
        console.error('R2 Upload Error:', error);
        return { success: false, error: error.message };
    }
}
