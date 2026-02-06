'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
            await Swal.fire({
                icon: 'success',
                title: 'Signed in successfully',
                timer: 1500,
                showConfirmButton: false,
                position: 'center'
            });
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.message || 'Invalid credentials',
                confirmButtonColor: 'var(--primary)'
            });
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative' // Allow global background
        }}>
            <div className="card fade-in" style={{ width: '400px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--primary)'
                    }}>
                        <LogIn size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p className="text-muted">Sign in to eTrackFac to continue</p>
                </div>

                {/* Success Message UI - Check URL param */}
                {typeof window !== 'undefined' && window.location.search.includes('success=true') && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={18} color="var(--success)" />
                        Registration successful! Please wait for admin approval.
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--error)',
                        borderRadius: '0.5rem',
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <ShieldAlert size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><Mail size={14} style={{ marginRight: '0.5rem' }} /> Email Address</label>
                        <input
                            type="email"
                            placeholder="name@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label><Lock size={14} style={{ marginRight: '0.5rem' }} /> Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>No account yet? <a href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one here</a></p>
                    <p className="text-muted">Faculty Tracking Management System v1.0</p>
                </div>
            </div>
        </div>
    );
}
