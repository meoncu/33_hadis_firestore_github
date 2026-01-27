'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hadith, HadithCategory } from '@/types/hadith';
import { Loader2, Save, X, Image as ImageIcon, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { uploadImageAction } from '@/app/admin/actions';
import { getProxyUrl } from '@/lib/utils';

const CATEGORIES: HadithCategory[] = ['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer'];

const schema = z.object({
    metin: z.string().min(10, 'Hadis metni en az 10 karakter olmalıdır'),
    ravi: z.string().optional(),
    kaynak: z.string().min(2, 'Kaynak belirtilmelidir'),
    kategori: z.enum(['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer']),
    yayinDurumu: z.enum(['draft', 'published']),
    dil: z.enum(['TR', 'EN']),
    siraNo: z.string().transform((val) => val === '' ? undefined : Number(val)).optional(),
    resimUrl: z.string().optional(),
});

interface HadithFormProps {
    initialData?: Hadith;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function HadithForm({ initialData, onSubmit, onCancel, isLoading: parentLoading }: HadithFormProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.resimUrl || null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            metin: initialData?.metin || '',
            ravi: initialData?.ravi || '',
            kaynak: initialData?.kaynak || '',
            kategori: initialData?.kategori || 'Ahlak',
            yayinDurumu: initialData?.yayinDurumu || 'draft',
            dil: initialData?.dil || 'TR',
            siraNo: initialData?.siraNo?.toString() || '',
            resimUrl: initialData?.resimUrl || '',
        },
    });

    const watchedResimUrl = watch('resimUrl');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (Örn: 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya çok büyük (Maksimum 5MB)');
            return;
        }

        // Yerel önizleme göster
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setUploadError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImageAction(formData);

            if (result.success && result.url) {
                setValue('resimUrl', result.url);
                setPreviewUrl(result.url);
                console.log('R2 Yükleme Başarılı:', result.url);
            } else {
                setUploadError(result.error || 'Yükleme başarısız oldu');
                setPreviewUrl(initialData?.resimUrl || null);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadError('Bağlantı hatası oluştu.');
            setPreviewUrl(initialData?.resimUrl || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white font-outfit">
                    {initialData ? 'Hadisi Düzenle' : 'Yeni Hadis Ekle'}
                </h2>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-400">Hadis Görseli (Cloudflare R2)</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-950/50 hover:bg-slate-800/30 transition-all group relative min-h-[180px]">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-blue-500" size={40} />
                                <span className="text-sm font-medium text-blue-400 animate-pulse">Buluta yükleniyor...</span>
                            </div>
                        ) : previewUrl || watchedResimUrl ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                                <img
                                    src={getProxyUrl(watchedResimUrl || previewUrl || '')}
                                    alt="Önizleme"
                                    className="max-h-[160px] object-contain rounded-lg shadow-2xl border border-slate-700"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // Placeholder fail olursa boş bir alan göster
                                        target.style.opacity = '0';
                                        console.error('Resim yüklenemedi, proxy kontrol edin.');
                                    }}
                                />
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors">
                                    Resmi Değiştir
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer w-full py-10">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-blue-500" size={32} />
                                </div>
                                <span className="text-slate-200 font-semibold mb-1">Resim Yükle</span>
                                <span className="text-slate-500 text-xs">PNG, JPG veya WEBP (Maks 5MB)</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}

                        {uploadError && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                    <AlertCircle size={12} />
                                    {uploadError}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gizli URL kutusu (Sadece sistem için, manuel düzenlenebilir) */}
                    <input type="hidden" {...register('resimUrl')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Sıra No</label>
                        <input {...register('siraNo')} type="number" className="w-full admin-input" placeholder="1" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Ravi (Opsiyonel)</label>
                        <input {...register('ravi')} className="w-full admin-input" placeholder="Ebu Hureyre" />
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
                    {errors.metin && <p className="mt-1 text-xs text-red-400 font-medium">{errors.metin.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kaynak</label>
                        <input {...register('kaynak')} className="w-full admin-input" placeholder="Buhari, Edeb 1" />
                        {errors.kaynak && <p className="mt-1 text-xs text-red-400 font-medium">{errors.kaynak.message}</p>}
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
                        <label className="block text-sm font-medium text-slate-400 mb-2">Durum</label>
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

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 transition-all font-medium">
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={parentLoading || uploading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-2.5 rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        {(parentLoading || uploading) ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {initialData ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
