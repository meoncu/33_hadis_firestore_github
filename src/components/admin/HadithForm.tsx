'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hadith, HadithCategory } from '@/types/hadith';
import { Loader2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';

const CATEGORIES: HadithCategory[] = ['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer'];

const schema = z.object({
    metin: z.string().min(10, 'Hadis metni en az 10 karakter olmalıdır'),
    ravi: z.string().optional(),
    kaynak: z.string().min(2, 'Kaynak belirtilmelidir'),
    kategori: z.enum(['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer']),
    yayinDurumu: z.enum(['draft', 'published']),
    dil: z.enum(['TR', 'EN']),
    siraNo: z.string().transform((val) => val === '' ? undefined : Number(val)).optional(),
});

interface HadithFormProps {
    initialData?: Hadith;
    onSubmit: (data: any, imageFile?: File | null) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function HadithForm({ initialData, onSubmit, onCancel, isLoading }: HadithFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.resimUrl || null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            metin: initialData?.metin || '',
            ravi: initialData?.ravi || '',
            kaynak: initialData?.kaynak || '',
            kategori: initialData?.kategori || 'Ahlak',
            yayinDurumu: initialData?.yayinDurumu || 'draft',
            dil: initialData?.dil || 'TR',
            siraNo: initialData?.siraNo?.toString() || '',
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                    {initialData ? 'Hadisi Düzenle' : 'Yeni Hadis Ekle'}
                </h2>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmit(data, imageFile))} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Hadis Resmi</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors group relative overflow-hidden min-h-[160px]">
                        {previewUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="max-h-[150px] object-contain rounded-lg shadow-lg" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer w-full">
                                <Upload className="text-slate-600 mb-2 group-hover:text-blue-400 transition-colors" size={32} />
                                <span className="text-slate-500 text-sm group-hover:text-slate-400">Bir resim seçmek için tıkla</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Sıra No</label>
                        <input
                            {...register('siraNo')}
                            type="number"
                            className="w-full admin-input"
                            placeholder="Örn: 1"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Ravi (Opsiyonel)</label>
                        <input {...register('ravi')} className="w-full admin-input" placeholder="Örn: Ebu Hureyre" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Hadis Metni</label>
                    <textarea
                        {...register('metin')}
                        rows={4}
                        className="w-full admin-input resize-none"
                        placeholder="Peygamber Efendimiz (sav) buyurdu ki..."
                    />
                    {errors.metin && <p className="mt-1 text-xs text-red-400">{errors.metin.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kaynak</label>
                        <input {...register('kaynak')} className="w-full admin-input" placeholder="Örn: Buhari, Edeb 1" />
                        {errors.kaynak && <p className="mt-1 text-xs text-red-400">{errors.kaynak.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kategori</label>
                        <select {...register('kategori')} className="w-full admin-input">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Yayın Durumu</label>
                        <select {...register('yayinDurumu')} className="w-full admin-input">
                            <option value="draft">Taslak</option>
                            <option value="published">Yayında</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Dil</label>
                        <select {...register('dil')} className="w-full admin-input">
                            <option value="TR">Türkçe</option>
                            <option value="EN">English</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary min-w-[140px]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {initialData ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
