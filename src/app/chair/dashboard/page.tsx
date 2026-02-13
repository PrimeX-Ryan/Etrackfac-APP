'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { CheckCircle, XCircle, FileText, ExternalLink, MessageSquare, Download, BarChart2, Users } from 'lucide-react';

interface Submission {
    id: number;
    faculty: { name: string; department: { name: string } };
    requirement: { name: string };
    status: 'pending' | 'approved' | 'rejected';
    file_path: string;
    remarks: string | null;
    created_at: string;
}

interface ComplianceData {
    faculty: {
        id: number;
        name: string;
        submissions: {
            requirement_id: number;
            requirement_name: string;
            status: string;
            deadline: string | null;
        }[];
    }[];
    requirements: { id: number; name: string }[];
}

export default function ChairDashboard() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
    const [view, setView] = useState<'reviews' | 'compliance'>('reviews');
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState<{ id: number; remarks: string } | null>(null);

    const fetchData = async () => {
        try {
            const [reviewsRes, complianceRes] = await Promise.all([
                api.get('/api/reviews'),
                api.get('/api/compliance')
            ]);
            setSubmissions(reviewsRes.data);
            setComplianceData(complianceRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReview = async (id: number, status: 'approved' | 'rejected', remarks: string) => {
        try {
            await api.post(`/api/reviews/${id}`, { status, remarks });
            setReviewModal(null);

            await Swal.fire({
                icon: 'success',
                title: `Submission ${status}`,
                timer: 1500,
                showConfirmButton: false,
                position: 'center'
            });

            await fetchData();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Review Failed',
                text: 'There was an error submitting your review.',
            });
        }
    };

    const handleDownload = async (submissionId: number, filename: string) => {
        try {
            const response = await api.get(`/api/submissions/${submissionId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // or extract from header
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Download Failed', text: 'Could not download the file.' });
        }
    };

    if (loading) return <div>Loading submissions...</div>;

    return (
        <div>
            <div className="card">
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => setView('reviews')}
                        className={`nav-link ${view === 'reviews' ? 'active' : ''}`}
                        style={{ borderRadius: '0.5rem', marginBottom: 0 }}
                    >
                        <FileText size={18} /> Reviews
                    </button>
                    <button
                        onClick={() => setView('compliance')}
                        className={`nav-link ${view === 'compliance' ? 'active' : ''}`}
                        style={{ borderRadius: '0.5rem', marginBottom: 0 }}
                    >
                        <BarChart2 size={18} /> Compliance Report
                    </button>
                </div>

                {view === 'reviews' ? (
                    <>
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
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${sub.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        <ExternalLink size={14} /> View
                                                    </a>
                                                    <button
                                                        onClick={() => handleDownload(sub.id, `submission-${sub.id}.${sub.file_path.split('.').pop()}`)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                </div>
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
                    </>
                ) : (
                    <div className="table-container">
                        {complianceData && (
                            <table style={{ minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'var(--surface)' }}>Faculty</th>
                                        {complianceData.requirements.map(req => (
                                            <th key={req.id} style={{ textAlign: 'center' }}>{req.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {complianceData.faculty.map(fac => (
                                        <tr key={fac.id}>
                                            <td style={{ position: 'sticky', left: 0, backgroundColor: 'white', fontWeight: 500 }}>{fac.name}</td>
                                            {fac.submissions.map(sub => (
                                                <td key={sub.requirement_id} style={{ textAlign: 'center' }}>
                                                    <span className={`badge badge-${sub.status === 'missing' ? 'rejected' : sub.status}`}>
                                                        {sub.status === 'missing' ? 'MISSING' : sub.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
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
