'use client';

import Link from 'next/link';
import { Book, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, loginWithGoogle, logout } = useAuth();

    const navLinks = [
        { name: 'Koleksiyonlar', href: '/' },
        { name: 'Ravi Portreleri', href: '#' },
        { name: 'Hakkımızda', href: '#' },
    ];

    return (
        <nav className="nav-blur">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                        <Book className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">HikmetPınarı</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-blue-400",
                                pathname === link.href ? "text-blue-400" : "text-slate-400"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {/* Hidden admin access - manual navigation only */}
                    <div className="h-6 w-px bg-slate-800" />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={user.photoURL || ''}
                                alt={user.displayName || ''}
                                className="w-8 h-8 rounded-full border border-blue-500/50"
                            />
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Çıkış
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={loginWithGoogle}
                            className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all border border-blue-500/20"
                        >
                            Giriş Yap
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-lg text-slate-300"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user.photoURL || ''}
                                    className="w-10 h-10 rounded-full border border-blue-500/50"
                                    alt=""
                                />
                                <span className="text-slate-200 font-medium line-clamp-1">{user.displayName}</span>
                            </div>
                            <button onClick={logout} className="text-red-400 font-medium shrink-0">Çıkış</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { loginWithGoogle(); setIsOpen(false); }}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-blue-600/20"
                        >
                            Google ile Giriş Yap
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
