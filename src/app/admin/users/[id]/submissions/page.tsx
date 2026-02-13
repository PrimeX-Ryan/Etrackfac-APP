'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

interface SubmissionItem {
    requirement_id: number;
    requirement: string;
    status: 'pending' | 'approved' | 'rejected';
    remarks: string | null;
    file_path: string | null;
    deadline: string | null;
    submission_id: number | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    department: { name: string } | null;
}

export default function AdminViewSubmissions({ params }: { params: { id: string } }) {
    const [checklist, setChecklist] = useState<SubmissionItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Details (we might need a specific endpoint or just list and find, 
                // but let's assume we can get user details or just use the ID for now. 
                // Ideally API provides a show endpoint, but we don't have one explicitly on AdminUser controller yet except maybe reused index?
                // Actually, let's just fetch the submissions and maybe the user details from a new endpoint or just display ID if name not easy.
                // Wait, I can probably fetch the user list and find, or add a show method. 
                // OR, just fetch the submissions and if I want name, I update the submissions endpoint to include user info or just use specific endpoint.
                // NOTE: I didn't add a 'show' method for user details in AdminUserController. 
                // I'll just skip detailed user info header for now or fetch list and find (inefficient but works for small app).

                // Fetch Submissions
                const subRes = await api.get(`/api/admin/users/${params.id}/submissions`);
                setChecklist(subRes.data);

                // Fetch User (Optional, for header) - using list for now since we don't have show
                const usersRes = await api.get('/api/admin/users');
                const foundUser = usersRes.data.find((u: any) => u.id.toString() === params.id);
                if (foundUser) setUser(foundUser);

            } catch (error) {
                console.error(error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load submissions.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleDownload = async (submissionId: number, filename: string) => {
        try {
            const response = await api.get(`/api/submissions/${submissionId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Download Failed', text: 'Could not download the file.' });
        }
    };

    if (loading) return <div>Loading submissions...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button onClick={() => router.back()} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2>Submission Checklist</h2>
                    {user && <p className="text-muted">Faculty: {user.name} ({user.department?.name || 'N/A'})</p>}
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>File</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checklist.map((item) => (
                            <tr key={item.requirement_id}>
                                <td data-label="Requirement">
                                    <p style={{ fontWeight: 500 }}>{item.requirement}</p>
                                </td>
                                <td data-label="Deadline">
                                    {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'N/A'}
                                </td>
                                <td data-label="Status">
                                    <span className={`badge badge-${item.status}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </td>
                                <td data-label="File">
                                    {item.file_path ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${item.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            >
                                                <ExternalLink size={14} /> View
                                            </a>
                                            <button
                                                onClick={() => handleDownload(item.submission_id!, `submission-${item.submission_id}.${item.file_path?.split('.').pop()}`)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>No file</span>
                                    )}
                                </td>
                                <td data-label="Remarks">
                                    {item.remarks ? (
                                        <span style={{ fontSize: '0.8rem' }}>{item.remarks}</span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
