import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(timestamp: any) {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function getProxyUrl(url: string | undefined | null) {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;
    if (!url.includes('r2.dev')) return url;
    const filename = url.split('/').pop();
    return `/api/image/${filename}`;
}
