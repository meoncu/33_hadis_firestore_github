import { Timestamp } from 'firebase/firestore';

export type HadithCategory = 'Ahlak' | 'İbadet' | 'Dua' | 'İman' | 'Sosyal Hayat' | 'Diğer';

export interface Hadith {
  id?: string;
  metin: string;
  ravi?: string;
  kaynak: string;
  kategori: HadithCategory;
  etiketler: string[];
  eklemeTarihi: Timestamp | any; // Firestore timestamp or Date
  dil: 'TR' | 'EN';
  siraNo?: number;
  resimUrl?: string;
  resimDurumu: 'none' | 'pending' | 'ready';
  yayinDurumu: 'draft' | 'published';
  goruntulenme: number;
  likeSayisi: number;
}
