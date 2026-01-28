'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Hadith } from '@/types/hadith';
import HadithForm from '@/components/admin/HadithForm';
import {
    Plus,
    Edit2,
    Trash2,
    LogOut,
    CheckCircle2,
    Clock,
    ImageIcon,
    Search,
    Users,
    Heart,
    Calendar,
    Activity,
    MessageSquare,
    ExternalLink,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { hadithService, userService, reportService } from '@/services/firestore';
import { formatDate } from '@/lib/utils';

export default function AdminDashboard() {
    const { user, loading: authLoading, logout, loginWithGoogle } = useAuth();
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'hadiths' | 'users' | 'reports'>('hadiths');
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHadith, setEditingHadith] = useState<Hadith | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const result = await hadithService.getHadiths({ pageSize: 120, includeDrafts: true });
            const sortedData = result.data.sort((a, b) => {
                const siraA = a.siraNo || Number.MAX_SAFE_INTEGER;
                const siraB = b.siraNo || Number.MAX_SAFE_INTEGER;
                return siraA - siraB;
            });
            setHadiths(sortedData);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const result = await userService.getUsers();
            setUsers(result);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const result = await reportService.getReports();
            setReports(result);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (activeTab === 'hadiths') fetchAll();
            else if (activeTab === 'users') fetchAllUsers();
            else fetchAllReports();
        }
    }, [user, activeTab]);

    const ADMIN_EMAIL = 'meoncu@gmail.com';

    if (authLoading) return <div className="p-20 text-center text-slate-400">Yükleniyor...</div>;

    if (!user || user.email !== ADMIN_EMAIL) return (
        <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center p-6 text-center">
            <div className="glass-card p-12 border border-slate-800 shadow-2xl flex flex-col items-center gap-6 max-w-lg">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <LogOut className="text-red-500" size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-outfit">
                        {!user ? 'Yönetim Paneline Giriş Yapın' : 'Yetkisiz Kullanıcı'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {!user
                            ? 'Bu alanı görebilmek için yönetici hesabınızla giriş yapmanız gerekmektedir.'
                            : `Üzgünüz, ${user.email} adresi yönetici yetkisine sahip değil.`}
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    {!user ? (
                        <button
                            onClick={() => loginWithGoogle()}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
                        >
                            Google ile Yönetici Girişi
                        </button>
                    ) : (
                        <button
                            onClick={() => logout()}
                            className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-red-600/20"
                        >
                            Çıkış Yap ve Başka Hesapla Dene
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            let finalData = { ...data };
            if (finalData.resimUrl) {
                finalData.resimDurumu = 'ready';
            } else {
                finalData.resimDurumu = 'none';
            }

            if (editingHadith) {
                await hadithService.updateHadith(editingHadith.id!, finalData);
            } else {
                await hadithService.addHadith(finalData);
            }

            setIsFormOpen(false);
            setEditingHadith(null);
            await fetchAll();
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`Kaydetme hatası: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu hadisi silmek istediğinize emin misiniz?')) {
            try {
                await hadithService.deleteHadith(id);
                await fetchAll();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050a14] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Yönetim Paneli</h1>
                        <p className="text-slate-500 text-sm">Hoş geldin, <span className="text-blue-400 font-medium">{user.email}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setEditingHadith(null); setIsFormOpen(true); }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={20} />
                            Yeni Hadis
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                            title="Çıkış Yap"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('hadiths')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'hadiths'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <ImageIcon size={18} />
                        Hadisler
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'users'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Users size={18} />
                        Kullanıcılar ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'reports'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <MessageSquare size={18} />
                        Bildirimler ({reports.filter(r => r.status === 'pending').length})
                    </button>
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-[#050a14]/90 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl">
                            <HadithForm
                                initialData={editingHadith || undefined}
                                suggestedSiraNo={Math.max(0, ...hadiths.map(h => h.siraNo || 0)) + 1}
                                onSubmit={handleSubmit}
                                onCancel={() => { setIsFormOpen(false); setEditingHadith(null); }}
                                isLoading={loading}
                            />
                        </div>
                    </div>
                )}

                {/* Content Table */}
                <div className="glass-card overflow-hidden border border-slate-800/50 shadow-2xl">
                    {activeTab === 'hadiths' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-widest">
                                        <th className="px-6 py-4 font-semibold">NO</th>
                                        <th className="px-6 py-4 font-semibold">GÖRSEL</th>
                                        <th className="px-6 py-4 font-semibold">HADİS METNİ</th>
                                        <th className="px-6 py-4 font-semibold">KATEGORİ</th>
                                        <th className="px-6 py-4 font-semibold">DURUM</th>
                                        <th className="px-6 py-4 font-semibold text-right">İŞLEMLER</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {hadiths.map((h) => (
                                        <tr key={h.id} className="hover:bg-blue-500/[0.03] transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-blue-400 font-bold font-outfit">#{h.siraNo || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {h.resimUrl ? (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                                                        <img
                                                            src={h.resimUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=Err';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 border border-slate-700">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-200 line-clamp-2 text-sm max-w-md">"{h.metin}"</p>
                                                <span className="text-slate-500 text-xs mt-1 block">{h.kaynak}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-md">
                                                    {h.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {h.yayinDurumu === 'published' ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                                        <CheckCircle2 size={14} /> Yayında
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                                                        <Clock size={14} /> Taslak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditingHadith(h); setIsFormOpen(true); }}
                                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(h.id!)}
                                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-widest">
                                        <th className="px-6 py-4 font-semibold">KULLANICI</th>
                                        <th className="px-6 py-4 font-semibold">E-POSTA</th>
                                        <th className="px-6 py-4 font-semibold">ETKİLEŞİM</th>
                                        <th className="px-6 py-4 font-semibold">SON GİRİŞ</th>
                                        <th className="px-6 py-4 font-semibold text-right">DURUM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-500/[0.03] transition-colors group">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full border border-slate-700" />
                                                <span className="text-slate-200 font-bold">{u.displayName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-red-400">
                                                        <Heart size={14} className="fill-current" />
                                                        <span className="font-bold">{u.totalLikes || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Activity size={14} />
                                                        <span className="text-[10px] uppercase font-bold tracking-tighter">Aktif</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                                {u.lastLogin ? formatDate(u.lastLogin) : 'Bilinmiyor'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {u.role === 'admin' ? 'Yönetici' : 'Üye'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-widest">
                                        <th className="px-6 py-4 font-semibold">GÖNDEREN / TARİH</th>
                                        <th className="px-6 py-4 font-semibold">HADİS BİLGİSİ</th>
                                        <th className="px-6 py-4 font-semibold">KULLANICI NOTU</th>
                                        <th className="px-6 py-4 font-semibold">DURUM</th>
                                        <th className="px-6 py-4 font-semibold text-right">İŞLEMLER</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {reports.map((r) => (
                                        <tr key={r.id} className="hover:bg-blue-500/[0.03] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 font-bold">{r.userName}</span>
                                                    <span className="text-slate-500 text-[10px] uppercase font-mono">{r.userEmail}</span>
                                                    <span className="text-slate-600 text-[10px] mt-1">{formatDate(r.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <p className="text-slate-400 text-xs italic line-clamp-2">"{r.hadithText}"</p>
                                                    <Link
                                                        href={`/hadis/${r.hadithId}`}
                                                        target="_blank"
                                                        className="text-blue-500 text-[10px] font-bold flex items-center gap-1 mt-1 hover:underline"
                                                    >
                                                        Hadise Git <ExternalLink size={10} />
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-slate-300 text-sm max-w-sm">
                                                    {r.note}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${r.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        r.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {r.status === 'pending' ? 'Bekliyor' : r.status === 'resolved' ? 'Çözüldü' : 'Görmezden Gelindi'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {r.status === 'pending' && (
                                                        <button
                                                            onClick={async () => {
                                                                await reportService.updateReportStatus(r.id, 'resolved');
                                                                fetchAllReports();
                                                            }}
                                                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                            title="Çözüldü İşaretle"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
                                                                await reportService.deleteReport(r.id);
                                                                fetchAllReports();
                                                            }
                                                        }}
                                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {((activeTab === 'hadiths' && hadiths.length === 0) || (activeTab === 'users' && users.length === 0) || (activeTab === 'reports' && reports.length === 0)) && !loading && (
                        <div className="py-24 text-center">
                            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600 mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-500">Gösterilecek öğe bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
