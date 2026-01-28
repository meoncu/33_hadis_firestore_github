import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    metadataBase: new URL('https://33-hadis-firestore-github.vercel.app'),
    title: "HikmetPınarı - Sahih Hadis Keşif Portalı",
    description: "Modern ve hızlı arayüzüyle sahih hadisleri keşfedin, paylaşın ve hayatınıza hikmet katın.",
    openGraph: {
        title: 'HikmetPınarı',
        description: 'Sahih Hadis Keşif Portalı',
        url: 'https://33-hadis-firestore-github.vercel.app',
        siteName: 'HikmetPınarı',
        images: [{ url: '/og-image.png' }],
        locale: 'tr_TR',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
                <Navbar />
                {children}
                <footer className="border-t border-slate-900 py-12 text-center text-slate-500 text-sm">
                    <p>© 2024 HikmetPınarı Hadis Galerisi. Tüm hakları saklıdır.</p>
                </footer>
            </body>
        </html>
    );
}
