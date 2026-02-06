'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { Plus, Settings2, Trash2, X, Save, FileCheck } from 'lucide-react';

interface Requirement {
    id: number;
    name: string;
    description: string | null;
    semester: string;
    is_required: boolean;
    submissions_count: number;
}

interface RequirementForm {
    name: string;
    description: string;
    semester: string;
    is_required: boolean;
}

export default function AdminRequirements() {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<RequirementForm>({
        name: '',
        description: '',
        semester: '2nd Semester 2025-2026',
        is_required: true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchRequirements = async () => {
        try {
            const res = await api.get('/api/admin/requirements');
            setRequirements(res.data);
        } catch (error) {
            console.error('Failed to fetch requirements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm({
            name: '',
            description: '',
            semester: '2nd Semester 2025-2026',
            is_required: true
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (req: Requirement) => {
        setEditingId(req.id);
        setForm({
            name: req.name,
            description: req.description || '',
            semester: req.semester,
            is_required: req.is_required
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (editingId) {
                await api.put(`/api/admin/requirements/${editingId}`, form);
            } else {
                await api.post('/api/admin/requirements', form);
            }
            setShowModal(false);
            fetchRequirements();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save requirement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Requirement?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/admin/requirements/${id}`);
                Swal.fire(
                    'Deleted!',
                    'Requirement has been deleted.',
                    'success'
                );
                fetchRequirements();
            } catch (err: any) {
                Swal.fire(
                    'Error!',
                    err.response?.data?.message || 'Failed to delete requirement',
                    'error'
                );
            }
        }
    };

    if (loading) return <div>Loading requirements...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Document Requirements</h2>
                    <p className="text-muted">Define the documents that faculty need to submit.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} /> New Requirement
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Requirement Name</th>
                            <th>Semester</th>
                            <th>Compulsory</th>
                            <th>Submissions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requirements.map(req => (
                            <tr key={req.id}>
                                <td data-label="Requirement Name">
                                    <p style={{ fontWeight: 600 }}>{req.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {req.description || 'No description'}
                                    </p>
                                </td>
                                <td data-label="Semester">{req.semester}</td>
                                <td data-label="Compulsory">{req.is_required ? 'Yes' : 'No'}</td>
                                <td data-label="Submissions">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileCheck size={14} className="text-muted" />
                                        {req.submissions_count}
                                    </div>
                                </td>
                                <td data-label="Action">
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem' }}
                                            onClick={() => openEditModal(req)}
                                        >
                                            <Settings2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem', color: 'var(--error)' }}
                                            onClick={() => handleDelete(req.id)}
                                            disabled={req.submissions_count > 0}
                                            title={req.submissions_count > 0 ? 'Cannot delete requirement with submissions' : 'Delete'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {requirements.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p className="text-muted">No requirements found. Create one to get started.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingId ? 'Edit Requirement' : 'New Requirement'}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--error)',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Requirement Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Course Syllabus"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief description of this requirement..."
                                />
                            </div>

                            <div className="input-group">
                                <label>Semester *</label>
                                <select
                                    value={form.semester}
                                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                >
                                    <option value="1st Semester 2025-2026">1st Semester 2025-2026</option>
                                    <option value="2nd Semester 2025-2026">2nd Semester 2025-2026</option>
                                    <option value="1st Semester 2026-2027">1st Semester 2026-2027</option>
                                    <option value="Summer 2026">Summer 2026</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input
                                    type="checkbox"
                                    id="is_required"
                                    checked={form.is_required}
                                    onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="is_required" style={{ marginBottom: 0 }}>
                                    This is a compulsory requirement
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save Requirement'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
