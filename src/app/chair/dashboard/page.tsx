'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, FileText, ExternalLink, MessageSquare } from 'lucide-react';

interface Submission {
    id: number;
    faculty: { name: string; department: { name: string } };
    requirement: { name: string };
    status: 'pending' | 'approved' | 'rejected';
    file_path: string;
    remarks: string | null;
    created_at: string;
}

export default function ChairDashboard() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState<{ id: number; remarks: string } | null>(null);

    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/api/reviews');
            setSubmissions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleReview = async (id: number, status: 'approved' | 'rejected', remarks: string) => {
        try {
            await api.post(`/api/reviews/${id}`, { status, remarks });
            setReviewModal(null);
            await fetchSubmissions();
        } catch (error) {
            alert('Review failed');
        }
    };

    if (loading) return <div>Loading submissions...</div>;

    return (
        <div>
            <div className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2>Pending Reviews</h2>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Faculty Name</th>
                                <th>Requirement</th>
                                <th>Date Submitted</th>
                                <th>File</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub.id}>
                                    <td data-label="Faculty Name">
                                        <p style={{ fontWeight: 500 }}>{sub.faculty.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.faculty.department?.name}</p>
                                    </td>
                                    <td data-label="Requirement">{sub.requirement.name}</td>
                                    <td data-label="Date Submitted">{new Date(sub.created_at).toLocaleDateString()}</td>
                                    <td data-label="File">
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${sub.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            <ExternalLink size={14} /> View Doc
                                        </a>
                                    </td>
                                    <td data-label="Status">
                                        <span className={`badge badge-${sub.status}`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td data-label="Action">
                                        {sub.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setReviewModal({ id: sub.id, remarks: '' })}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {reviewModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '450px' }}>
                        <h3>Review Submission</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Provide feedback and approve or reject this document.</p>

                        <div className="input-group">
                            <label>Remarks / Feedback</label>
                            <textarea
                                rows={4}
                                value={reviewModal.remarks}
                                onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                                placeholder="Enter your review notes here..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => handleReview(reviewModal.id, 'approved', reviewModal.remarks)}
                                className="btn btn-primary"
                                style={{ flex: 1, backgroundColor: 'var(--success)' }}
                            >
                                <CheckCircle size={18} /> Approve
                            </button>
                            <button
                                onClick={() => handleReview(reviewModal.id, 'rejected', reviewModal.remarks)}
                                className="btn btn-primary"
                                style={{ flex: 1, backgroundColor: 'var(--error)' }}
                            >
                                <XCircle size={18} /> Reject
                            </button>
                            <button
                                onClick={() => setReviewModal(null)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
