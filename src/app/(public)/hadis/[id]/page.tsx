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

    // Social Media Image (Crawlers need the real URL, not our proxy)
    const imageUrl = hadith.resimUrl || 'https://33-hadis-firestore-github.vercel.app/og-image.png';

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
