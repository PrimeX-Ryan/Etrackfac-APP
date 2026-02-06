'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { Upload, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ChecklistItem {
    requirement_id: number;
    requirement: string;
    status: 'pending' | 'approved' | 'rejected';
    remarks: string | null;
    file_path: string | null;
}

export default function FacultyDashboard() {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);

    const fetchChecklist = async () => {
        try {
            const response = await api.get('/api/submissions/checklist');
            setChecklist(response.data);
        } catch (error) {
            console.error('Failed to fetch checklist', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, []);

    const handleFileUpload = async (requirementId: number, file: File) => {
        setUploading(requirementId);
        const formData = new FormData();
        formData.append('requirement_id', requirementId.toString());
        formData.append('document', file);

        try {
            await api.post('/api/submissions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchChecklist();
            Swal.fire({
                title: 'Uploaded!',
                text: 'Your document has been submitted successfully.',
                icon: 'success',
                confirmButtonColor: 'var(--primary)',
                timer: 2000
            });
        } catch (error) {
            Swal.fire({
                title: 'Upload Failed',
                text: 'There was an error uploading your document. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--primary)'
            });
        } finally {
            setUploading(null);
        }
    };

    if (loading) return <div>Loading checklist...</div>;

    return (
        <div className="dashboard-grid">
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Document Checklist</h2>
                    <span className="text-muted">{checklist.filter(i => i.status === 'approved').length} / {checklist.length} Completed</span>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Requirement</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checklist.map((item) => (
                                <tr key={item.requirement_id}>
                                    <td data-label="Requirement">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <FileText size={18} className="text-muted" />
                                            <div>
                                                <p style={{ fontWeight: 500 }}>{item.requirement}</p>
                                                {item.file_path && <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>File uploaded</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Status">
                                        <span className={`badge badge-${item.status}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td data-label="Remarks">
                                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                            {item.remarks || '-'}
                                        </span>
                                    </td>
                                    <td data-label="Action">
                                        {(item.status === 'pending' || item.status === 'rejected') ? (
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    id={`file-${item.requirement_id}`}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(item.requirement_id, e.target.files[0])}
                                                    disabled={uploading === item.requirement_id}
                                                />
                                                <label
                                                    htmlFor={`file-${item.requirement_id}`}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                                >
                                                    {uploading === item.requirement_id ? <Clock size={14} className="spin" /> : <Upload size={14} />}
                                                    {item.status === 'rejected' ? 'Re-upload' : 'Upload'}
                                                </label>
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <CheckCircle2 size={16} /> Verified
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Action</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{checklist.filter(i => i.status !== 'approved').length}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Approved Docs</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{checklist.filter(i => i.status === 'approved').length}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Rejected</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{checklist.filter(i => i.status === 'rejected').length}</p>
                </div>
            </div>
        </div>
    );
}
