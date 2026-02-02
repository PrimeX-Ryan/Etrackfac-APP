'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UserPlus, UserCheck, Shield, Trash2, Check, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    department: { name: string } | null;
    roles: { name: string }[];
    status: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/api/admin/users/${id}/approve`);
            fetchUsers(); // Refresh list
        } catch (error) {
            alert("Failed to approve user");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject and remove this user?')) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert("Failed to reject user");
        }
    }

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>System Users</h2>
                    <p className="text-muted">Manage roles and permissions for all users.</p>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td data-label="User">
                                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                </td>
                                <td data-label="Role"><span className="badge badge-approved" style={{ textTransform: 'uppercase' }}>{user.roles[0]?.name || 'No Role'}</span></td>
                                <td data-label="Department">{user.department?.name || 'N/A'}</td>
                                <td data-label="Status">
                                    {user.status === 'pending' ? (
                                        <span className="badge badge-pending">PENDING</span>
                                    ) : (
                                        <span className="badge badge-approved" style={{ color: 'var(--success)' }}>ACTIVE</span>
                                    )}
                                </td>
                                <td data-label="Action">
                                    {user.status === 'pending' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--success)' }}
                                            >
                                                <Check size={14} style={{ marginRight: '4px' }} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--error)' }}
                                            >
                                                <X size={14} style={{ marginRight: '4px' }} /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><Trash2 size={16} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
