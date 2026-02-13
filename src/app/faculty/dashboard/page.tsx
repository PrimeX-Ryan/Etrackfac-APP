'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { Upload, FileText, AlertCircle, CheckCircle2, Clock, Bell, X } from 'lucide-react';

interface ChecklistItem {
    requirement_id: number;
    requirement: string;
    status: 'pending' | 'approved' | 'rejected';
    remarks: string | null;
    file_path: string | null;
    deadline: string | null;
}

interface Notification {
    id: number;
    message: string;
    read: boolean;
    created_at: string;
}

export default function FacultyDashboard() {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [checklistRes, notificationsRes] = await Promise.all([
                api.get('/api/submissions/checklist'),
                api.get('/api/notifications')
            ]);
            setChecklist(checklistRes.data);
            setNotifications(notificationsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    useEffect(() => {
        fetchData();
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
            await fetchData();
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="text-muted">{checklist.filter(i => i.status === 'approved').length} / {checklist.length} Completed</span>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
                                <Bell className="text-muted" />
                                {notifications.some(n => !n.read) && (
                                    <span style={{
                                        position: 'absolute', top: -5, right: -5, width: 10, height: 10,
                                        backgroundColor: 'var(--error)', borderRadius: '50%'
                                    }} />
                                )}
                            </button>
                            {showNotifications && (
                                <div className="card" style={{
                                    position: 'absolute', top: '100%', right: 0, width: '300px',
                                    zIndex: 100, padding: '1rem', marginTop: '0.5rem',
                                    maxHeight: '400px', overflowY: 'auto'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4>Notifications</h4>
                                        <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <p className="text-muted">No notifications</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {notifications.map(n => (
                                                <div key={n.id}
                                                    onClick={() => !n.read && markAsRead(n.id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: n.read ? 'transparent' : 'var(--surface)',
                                                        borderRadius: '0.5rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    <p style={{ fontSize: '0.875rem' }}>{n.message}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Requirement</th>
                                <th>Deadline</th>
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
                                    <td data-label="Deadline">
                                        {item.deadline ? (
                                            <span style={{
                                                color: new Date(item.deadline) < new Date() && item.status !== 'approved'
                                                    ? 'var(--error)' : 'var(--text-muted)',
                                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                                            }}>
                                                <Clock size={14} />
                                                {new Date(item.deadline).toLocaleDateString()}
                                            </span>
                                        ) : <span className="text-muted">-</span>}
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
