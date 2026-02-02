'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)'
    }}>
      <div className="logo-container" style={{ marginBottom: '3rem' }}>
        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.5); }
            100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
          }
          .logo-wrapper {
            animation: float 4s ease-in-out infinite;
            border-radius: 50%;
            padding: 2rem;
            background: var(--surface);
            border: 1px solid var(--border);
          }
          .logo-image {
             filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
          }
        `}</style>

        <div className="logo-wrapper">
          <Image
            src="/Logo.png"
            alt="eTrackFac Logo"
            width={150}
            height={150}
            className="logo-image"
            priority
          />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          eTrackFac
        </h1>
        <p className="text-muted" style={{ marginBottom: '3rem' }}>Faculty Document Tracking System</p>

        <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 3rem', borderRadius: '9999px', fontSize: '1.25rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
          Continue
        </Link>
      </div>
    </div>
  );
}
