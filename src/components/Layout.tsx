'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FileText,
    CheckSquare,
    BarChart2,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Bell,
    Menu,
    ArrowLeft,
    User,
    ChevronDown,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) return <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!user && pathname !== '/login' && pathname !== '/' && pathname !== '/register') return null; // Role guard will handle redirection

    const getNavItems = () => {
        const items = [];
        const roles = user?.roles.map(r => r.name) || [];

        if (roles.includes('faculty')) {
            items.push({ name: 'Dashboard', icon: LayoutDashboard, href: '/faculty/dashboard' });
        }
        if (roles.includes('program_chair')) {
            items.push({ name: 'Review Submissions', icon: CheckSquare, href: '/chair/dashboard' });
        }
        if (roles.includes('dean')) {
            items.push({ name: 'Compliance Reports', icon: BarChart2, href: '/dean/reports' });
        }
        if (roles.includes('admin')) {
            items.push({ name: 'User Management', icon: Users, href: '/admin/users' });
            items.push({ name: 'Requirements', icon: Settings, href: '/admin/requirements' });
        }

        return items;
    };

    const navItems = getNavItems();

    if (pathname === '/login' || pathname === '/' || pathname === '/register') return <>{children}</>;

    return (
        <div className="app-container">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="hamburger-btn"
                >
                    <Menu size={24} color="var(--text)" />
                </button>
            </header>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ marginBottom: '2rem' }}>
                    {/* Sidebar Header (Mobile Only Close Button) */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2rem',
                    }}>
                        {/* Desktop Logo */}
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>eTrackFac</span>
                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="mobile-close-btn"
                        >
                            <ArrowLeft size={20} /> <span style={{ fontSize: '0.875rem' }}>Back</span>
                        </button>
                    </div>

                    {/* Profile Section (Centered like image) */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            {user?.name.charAt(0)}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{user?.name}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>{user?.roles[0]?.name.toUpperCase()}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.department?.name || 'Department'}</p>
                    </div>

                    {/* Action Buttons (Profile, Logout, Pill style) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Link href="/profile" className="btn btn-primary btn-full" style={{ borderRadius: '9999px', textDecoration: 'none', justifyContent: 'center' }}>
                            <User size={16} /> Profile
                        </Link>
                        <button onClick={logout} className="btn btn-secondary btn-full" style={{ borderRadius: '9999px', justifyContent: 'center' }}>
                            <LogOut size={16} /> Log out
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1 }}>
                        <ul style={{ listStyle: 'none' }}>
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Footer Info */}
                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <p>eTrackFac v1.0.0</p>
                </div>
            </aside>

            <main className="main-content">
                <header className="desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem', fontSize: '1.75rem' }}>{navItems.find(i => i.href === pathname)?.name || 'Welcome'}</h1>
                        <p className="text-muted">You are logged in as {user?.roles[0]?.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>
                <div className="fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
