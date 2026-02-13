'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, X, Check, Save } from 'lucide-react';
import Swal from 'sweetalert2';

interface Semester {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminSemesters() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSemester, setCurrentSemester] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        is_active: false
    });

    const fetchSemesters = async () => {
        try {
            const res = await api.get('/api/semesters');
            setSemesters(res.data);
        } catch (error) {
            console.error("Failed to fetch semesters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    const openModal = (semester: Semester | null = null) => {
        if (semester) {
            setIsEditing(true);
            setCurrentSemester(semester.id);
            setFormData({
                name: semester.name,
                is_active: Boolean(semester.is_active)
            });
        } else {
            setIsEditing(false);
            setCurrentSemester(null);
            setFormData({
                name: '',
                is_active: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentSemester) {
                await api.put(`/api/semesters/${currentSemester}`, formData);
                Swal.fire({ icon: 'success', title: 'Semester Updated', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/api/semesters', formData);
                Swal.fire({ icon: 'success', title: 'Semester Created', timer: 1500, showConfirmButton: false });
            }
            setIsModalOpen(false);
            fetchSemesters();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Operation failed.'
            });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Semester?',
            text: "Type 'delete' to confirm. This will remove all associated requirements!",
            input: 'text',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!',
            preConfirm: (value) => {
                if (value !== 'delete') {
                    Swal.showValidationMessage('You must type "delete" to confirm')
                }
            }
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/semesters/${id}`, {
                    params: { confirmation: 'delete' }
                });
                Swal.fire('Deleted!', 'Semester has been removed.', 'success');
                fetchSemesters();
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete semester.', 'error');
            }
        }
    }

    if (loading) return <div>Loading semesters...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Academic Semesters</h2>
                    <p className="text-muted">Manage active and past semesters.</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <Plus size={18} /> Add Semester
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Semester Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {semesters.map(semester => (
                            <tr key={semester.id}>
                                <td data-label="Semester Name">
                                    <p style={{ fontWeight: 600 }}>{semester.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {new Date(semester.created_at).toLocaleDateString()}</p>
                                </td>
                                <td data-label="Status">
                                    {semester.is_active ? (
                                        <span className="badge badge-approved" style={{ color: 'var(--success)' }}>ACTIVE</span>
                                    ) : (
                                        <span className="badge badge-pending">INACTIVE</span>
                                    )}
                                </td>
                                <td data-label="Action">
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openModal(semester)} className="btn btn-secondary" title="Edit">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(semester.id)} className="btn btn-danger" title="Delete" style={{ backgroundColor: 'var(--error)', color: 'white' }}>
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
                            <h3>{isEditing ? 'Edit Semester' : 'Add Semester'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Semester Name</label>
                                <input type="text" required placeholder="e.g. 1st Semester 2023-2024" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                <label htmlFor="is_active" style={{ marginBottom: 0 }}>Set as Active Semester</label>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                                <Save size={18} /> {isEditing ? 'Update Semester' : 'Create Semester'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
