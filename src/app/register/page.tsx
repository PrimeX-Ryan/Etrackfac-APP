'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const { login } = useAuth();

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('faculty');
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch departments for dropdown
        const fetchDepts = async () => {
            try {
                const res = await api.get('/api/departments');
                setDepartments(res.data);
                if (res.data.length > 0) setDepartmentId(res.data[0].id.toString());
            } catch (err) {
                console.error("Failed to load departments");
            }
        };
        fetchDepts();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await api.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role,
                department_id: departmentId
            });
            // Redirect to login with success flag
            router.push('/login?success=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.95)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p className="text-muted">Join eTrackFac</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {/* Success Message UI - Check URL param */}
                {typeof window !== 'undefined' && window.location.search.includes('success=true') && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Registration successful! Please wait for admin approval before logging in.
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required placeholder="••••••••" />
                    </div>

                    <div className="input-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                            <option value="faculty">Faculty</option>
                            <option value="program_chair">Program Chair</option>
                            <option value="dean">Dean</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Department</label>
                        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem', borderRadius: '9999px' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </div>
    );
}
