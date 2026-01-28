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

    // Botlar için doğrudan R2 linkini kullanıyoruz (onların tarih sorunu yok)
    // Eğer resim yoksa sitenin ana logosunu kullan
    const imageUrl = hadith.resimUrl || 'https://hadis.ankebut.com.tr/og-image.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://hadis.ankebut.com.tr/hadis/${params.id}`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                    type: 'image/png', // Varsayılan tip
                },
            ],
            siteName: 'HikmetPınarı',
            locale: 'tr_TR',
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
    const rawHadith = await hadithService.getHadithById(params.id);

    if (!rawHadith) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Hadis bulunamadı.
            </div>
        );
    }

    // Serialize data: Firestore Timestamp objects cannot be passed directly to Client Components
    const hadith = {
        ...rawHadith,
        eklemeTarihi: rawHadith.eklemeTarihi?.toDate
            ? rawHadith.eklemeTarihi.toDate().toISOString()
            : rawHadith.eklemeTarihi
    };

    return <HadithDetailClient hadith={hadith as any} />;
}
