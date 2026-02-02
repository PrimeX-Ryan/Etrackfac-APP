'use client';

import React from 'react';
import { Plus, Settings2, Calendar, FileCheck } from 'lucide-react';

export default function AdminRequirements() {
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Document Requirements</h2>
                    <p className="text-muted">Define the documents that faculty need to submit.</p>
                </div>
                <button className="btn btn-primary">
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
                        <tr>
                            <td>
                                <p style={{ fontWeight: 600 }}>Course Syllabus</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for all major subjects</p>
                            </td>
                            <td>1st Semester 2026</td>
                            <td>Yes</td>
                            <td>12 / 45</td>
                            <td>
                                <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><Settings2 size={16} /></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
