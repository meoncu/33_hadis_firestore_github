import { hadithService } from '@/services/firestore';
import HadithDetailClient from './HadithDetailClient';
import { Metadata } from 'next';

interface PageProps {
    params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const hadith = await hadithService.getHadithById(params.id);

    if (!hadith) {
        return {
            title: 'Hadis Bulunamadı',
        };
    }

    const title = `Hadis #${hadith.siraNo || ''} - ${hadith.kategori}`;
    const description = hadith.metin.substring(0, 160) + '...';

    // Sosyal medya botları için resmi kendi domainimiz üzerinden tam adres olarak veriyoruz
    let imageUrl = 'https://hadis.ankebut.com.tr/og-image.png';
    if (hadith.resimUrl) {
        const filename = hadith.resimUrl.split('/').pop();
        imageUrl = `https://hadis.ankebut.com.tr/api/image/${filename}`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: hadith.kategori,
                },
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function HadithDetailPage({ params }: PageProps) {
    const hadith = await hadithService.getHadithById(params.id);

    if (!hadith) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Hadis bulunamadı.
            </div>
        );
    }

    return <HadithDetailClient hadith={hadith} />;
}
