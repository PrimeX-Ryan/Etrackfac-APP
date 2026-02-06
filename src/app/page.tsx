'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashScreen() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // Navigate to login after 5 seconds
    const navigateTimer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out'
    }}>
      <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .logo-container {
                    animation: float 3s ease-in-out infinite;
                }
                .logo-image {
                    filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.4));
                }
                .loading-ring {
                    width: 200px;
                    height: 200px;
                    border: 3px solid transparent;
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    position: absolute;
                    animation: spin 1.5s linear infinite;
                }
                .loading-ring-outer {
                    width: 220px;
                    height: 220px;
                    border: 2px solid transparent;
                    border-bottom: 2px solid rgba(99, 102, 241, 0.3);
                    border-radius: 50%;
                    position: absolute;
                    animation: spin 2s linear infinite reverse;
                }
                .loading-text {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `}</style>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <div className="loading-ring-outer"></div>
        <div className="loading-ring"></div>
        <div className="logo-container">
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
        <h1 style={{
          marginBottom: '0.5rem',
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
          fontWeight: 700
        }}>
          eTrackFac
        </h1>
        <p className="text-muted loading-text" style={{ marginBottom: '1rem' }}>
          Faculty Document Tracking System
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            animation: 'pulse 1s ease-in-out infinite'
          }}></div>
          Loading...
        </div>
      </div>
    </div>
  );
}
