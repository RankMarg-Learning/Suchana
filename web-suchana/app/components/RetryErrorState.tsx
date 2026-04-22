"use client";

import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

interface RetryErrorStateProps {
  message?: string;
  title?: string;
}

export default function RetryErrorState({ 
  message = "We're having trouble connecting to our servers. Retrying latest update automatically...",
  title = "Page Loading Interrupted"
}: RetryErrorStateProps) {
  return (
    <div className="retry-error-container">
      <div className="retry-error-content">
        <div className="skeleton-hero">
          <div className="skeleton-tag"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        
        <div className="retry-status-overlay">
          <div className="retry-status-card">
            <div className="retry-icon-wrap">
              <RefreshCw className="spin-icon" size={24} color="var(--accent)" />
            </div>
            <div className="retry-text-wrap">
              <h3 className="retry-title">{title}</h3>
              <p className="retry-message">{message}</p>
            </div>
          </div>
        </div>

        <div className="skeleton-body">
          <div className="skeleton-line full"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line long"></div>
          <div className="skeleton-grid">
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .retry-error-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 100px 20px 40px;
          display: flex;
          justify-content: center;
        }

        .retry-error-content {
          max-width: 800px;
          width: 100%;
          position: relative;
        }

        .retry-status-overlay {
          position: sticky;
          top: 100px;
          z-index: 10;
          margin: 40px 0;
        }

        .retry-status-card {
          background: var(--bg-secondary);
          border: 1.5px solid var(--accent-light);
          border-left: 4px solid var(--accent);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          animation: slideIn 0.5s ease-out;
        }

        .retry-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(124, 58, 237, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .retry-title {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .retry-message {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          font-weight: 500;
        }

        .skeleton-hero {
          margin-bottom: 40px;
          opacity: 0.4;
        }

        .skeleton-tag {
          width: 80px;
          height: 20px;
          background: var(--border);
          border-radius: 40px;
          margin-bottom: 16px;
        }

        .skeleton-title {
          width: 70%;
          height: 40px;
          background: var(--border);
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .skeleton-subtitle {
          width: 40%;
          height: 20px;
          background: var(--border);
          border-radius: 6px;
        }

        .skeleton-body {
          opacity: 0.3;
        }

        .skeleton-line {
          height: 16px;
          background: var(--border);
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-line.full { width: 100%; }
        .skeleton-line.medium { width: 85%; }
        .skeleton-line.long { width: 92%; }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 40px;
        }

        .skeleton-item {
          height: 120px;
          background: var(--border);
          border-radius: 12px;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spin-icon {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
