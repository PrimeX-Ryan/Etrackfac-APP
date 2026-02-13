'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UserPlus, UserCheck, Shield, Trash2, Check, X, Edit2, Save } from 'lucide-react';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    email: string;
    department: { id: number; name: string } | null;
    roles: { name: string }[];
    status: string;
}

interface Department {
    id: number;
    name: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'faculty',
        department_id: ''
    });

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

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/departments');
            setDepartments(res.data);
        } catch (error) {
            console.error("Failed to fetch departments");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const openModal = (user: User | null = null) => {
        if (user) {
            setIsEditing(true);
            setCurrentUser(user.id);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Leave blank if not changing
                role: user.roles[0]?.name || 'faculty',
                department_id: user.department?.id.toString() || ''
            });
        } else {
            setIsEditing(false);
            setCurrentUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'faculty',
                department_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentUser) {
                await api.put(`/api/admin/users/${currentUser}`, formData);
                Swal.fire({ icon: 'success', title: 'User Updated', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/api/admin/users', formData);
                Swal.fire({ icon: 'success', title: 'User Created', timer: 1500, showConfirmButton: false });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Operation failed.'
            });
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/api/admin/users/${id}/approve`);
            Swal.fire({ icon: 'success', title: 'Approved!', timer: 1500, showConfirmButton: false });
            fetchUsers();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to approve user' });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this user?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/admin/users/${id}`);
                Swal.fire('Deleted!', 'User has been removed.', 'success');
                fetchUsers();
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete user.', 'error');
            }
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
                <button onClick={() => openModal()} className="btn btn-primary">
                    <UserPlus size={18} /> Add User
                </button>
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
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openModal(user)} className="btn btn-secondary" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        {user.status === 'pending' && (
                                            <button onClick={() => handleApprove(user.id)} className="btn btn-success" title="Approve" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(user.id)} className="btn btn-danger" title="Delete" style={{ backgroundColor: 'var(--error)', color: 'white' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Password {isEditing && '(Leave blank to keep current)'}</label>
                                <input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="faculty">Faculty</option>
                                    <option value="program_chair">Program Chair</option>
                                    <option value="dean">Dean</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Department</label>
                                <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                                <Save size={18} /> {isEditing ? 'Update User' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
