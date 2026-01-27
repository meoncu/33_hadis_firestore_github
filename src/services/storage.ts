import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
    async uploadHadithImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storageRef = ref(storage, `hadiths/${fileName}`);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    async deleteImage(imageUrl: string) {
        try {
            if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return;
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }
};
