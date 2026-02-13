'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Briefcase, Shield, Building2, Edit2, X, Save } from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const { user, loading, checkAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const openEditModal = () => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: ''
            });
            setIsEditing(true);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/api/user/profile', formData);
            await checkAuth(); // Refresh user data
            setIsEditing(false);
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'An error occurred while updating your profile.'
            });
        }
    };

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
                paddingBottom: '2rem',
                position: 'relative'
            }}>
                <button
                    onClick={openEditModal}
                    className="btn btn-secondary"
                    style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem', borderRadius: '50%' }}
                    title="Edit Profile"
                >
                    <Edit2 size={18} />
                </button>

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

            {isEditing && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>New Password (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary btn-full">
                                    <Save size={18} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-full">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
