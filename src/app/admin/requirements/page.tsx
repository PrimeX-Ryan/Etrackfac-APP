'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { Plus, Settings2, Trash2, X, Save, FileCheck } from 'lucide-react';

interface Requirement {
    id: number;
    name: string;
    description: string | null;
    semester: { id: number; name: string } | null;
    semester_id: number;
    is_required: boolean;
    submissions_count: number;
}

interface RequirementForm {
    name: string;
    description: string;
    semester_id: string; // Use string for select value
    is_required: boolean;
}

interface Semester {
    id: number;
    name: string;
    is_active: boolean;
}

export default function AdminRequirements() {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<RequirementForm>({
        name: '',
        description: '',
        semester_id: '',
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

    const fetchSemesters = async () => {
        try {
            const res = await api.get('/api/semesters');
            setSemesters(res.data);
            // potentially set default semester to active one
            const active = res.data.find((s: Semester) => s.is_active);
            if (active) {
                setForm(prev => ({ ...prev, semester_id: active.id.toString() }));
            }
        } catch (error) {
            console.error('Failed to fetch semesters');
        }
    };

    useEffect(() => {
        fetchRequirements();
        fetchSemesters();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        // Default to active semester if available
        const active = semesters.find(s => s.is_active);
        setForm({
            name: '',
            description: '',
            semester_id: active ? active.id.toString() : (semesters[0]?.id.toString() || ''),
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
            semester_id: req.semester_id?.toString() || req.semester?.id.toString() || '',
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
                // If it has submissions, we need to ask for force delete or just force it if user confirmed "Yes, delete it!" 
                // The backend requires 'force=true' query param if submissions exist.
                // The updated backend returns 422 with 'requires_confirmation' if we try to delete without force.
                // Let's first try normal delete.
                await api.delete(`/api/admin/requirements/${id}`);
                Swal.fire('Deleted!', 'Requirement has been deleted.', 'success');
                fetchRequirements();
            } catch (err: any) {
                // If backend requires confirmation (422)
                if (err.response?.status === 422 && err.response?.data?.requires_confirmation) {
                    const forceResult = await Swal.fire({
                        title: 'Force Delete?',
                        text: `This requirement has ${err.response.data.submission_count} submissions. Deleting it will remove ALL associated submissions. Are you sure?`,
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'Yes, FORCE DELETE'
                    });

                    if (forceResult.isConfirmed) {
                        try {
                            await api.delete(`/api/admin/requirements/${id}?force=true`);
                            Swal.fire('Deleted!', 'Requirement and submissions deleted.', 'success');
                            fetchRequirements();
                        } catch (forceErr: any) {
                            Swal.fire('Error!', 'Failed to force delete.', 'error');
                        }
                    }
                } else {
                    Swal.fire('Error!', err.response?.data?.message || 'Failed to delete requirement', 'error');
                }
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
                                <td data-label="Semester">{req.semester?.name || 'N/A'}</td>
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
                                    value={form.semester_id}
                                    onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                    required
                                >
                                    <option value="" disabled>Select Semester</option>
                                    {semesters.map(sem => (
                                        <option key={sem.id} value={sem.id}>
                                            {sem.name} {sem.is_active ? '(Active)' : ''}
                                        </option>
                                    ))}
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
