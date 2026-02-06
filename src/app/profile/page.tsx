'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Briefcase, Shield, Building2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading profile...</div>;
    if (!user) return <div>Please log in to view profile.</div>;

    const role = user.roles && user.roles.length > 0 ? user.roles[0].name : 'N/A';
    const department = user.department ? user.department.name : 'N/A';

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '2rem'
            }}>
                <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    {user.name.charAt(0)}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{user.name}</h2>
                <div className="badge badge-approved" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>
                    {role}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Mail size={18} className="text-muted" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</span>
                    </div>
                    <p style={{ fontWeight: 500 }}>{user.email}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Building2 size={18} className="text-muted" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Department</span>
                    </div>
                    <p style={{ fontWeight: 500 }}>{department}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={18} className="text-muted" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Role Permissions</span>
                    </div>
                    <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{role}</p>
                </div>

                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Briefcase size={18} className="text-muted" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Account Status</span>
                    </div>
                    <span className="badge badge-approved">Active</span>
                </div>
            </div>
        </div>
    );
}
