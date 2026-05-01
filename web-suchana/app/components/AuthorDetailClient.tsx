"use client";

import React, { useState } from 'react';
import { Author, Exam, SeoPage, cleanLabel, formatDate, enumToSlug } from '../lib/types';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, MapPin, Calendar, CheckCircle, Grid, FileText, Share2, MoreHorizontal } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { fetchAuthorBySlug } from '../lib/api';

interface Props {
  slug: string;
}

export default function AuthorDetailClient({ slug }: Props) {
  const [activeTab, setActiveTab] = useState<'articles' | 'exams'>('articles');

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author', slug],
    queryFn: () => fetchAuthorBySlug(slug),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!author || 'error' in author) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: 16 }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Author Not Found</h2>
        <Link href="/" style={{ color: 'var(--accent)' }}>Go Home</Link>
      </div>
    );
  }

  const { name, image, designation, bio, exams = [], seoPages = [] } = author;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Main Container */}
      <div className="container" style={{ maxWidth: 935, margin: '0 auto', padding: 'clamp(40px, 8vh, 80px) 20px' }}>

        {/* Instagram Style Header */}
        <header style={{
          display: 'flex',
          gap: 'clamp(30px, 8vw, 100px)',
          marginBottom: 44,
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          {/* Avatar Section */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 'clamp(120px, 20vw, 168px)',
              height: 'clamp(120px, 20vw, 168px)',
              borderRadius: '50%',
              padding: 4,
              background: 'var(--accent)',
              boxShadow: '0 10px 30px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid var(--bg-primary)',
                overflow: 'hidden',
                background: 'var(--bg-card)'
              }}>
                <img
                  src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=300`}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Row: Name & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 300, margin: 0, color: 'var(--text-primary)' }}>
                  {name}
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--accent-glow)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  marginTop: 4,
                  border: '1px solid rgba(124, 58, 237, 0.1)'
                }} title="Verified Author">
                  <CheckCircle size={14} fill="var(--accent)" color="white" strokeWidth={2} />
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>Verified</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

              </div>
            </div>

            {/* Middle Row: Stats */}
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ fontSize: '1rem' }}>
                <strong style={{ fontWeight: 700 }}>{seoPages.length}</strong> articles
              </div>
              <div style={{ fontSize: '1rem' }}>
                <strong style={{ fontWeight: 700 }}>{exams.length}</strong> exams
              </div>
            </div>

            {/* Bottom Row: Bio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{designation || 'Content Strategist'}</div>
              <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                {bio}
              </p>
              <div style={{ marginTop: 8, color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
                Expert in Competitive Exams & Career Guidance
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div style={{
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center',
          gap: 60
        }}>
          <button
            onClick={() => setActiveTab('articles')}
            style={{
              background: 'none',
              border: 'none',
              borderTop: activeTab === 'articles' ? '1px solid var(--text-primary)' : '1px solid transparent',
              marginTop: -1,
              padding: '16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: activeTab === 'articles' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            <Grid size={12} /> Articles
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            style={{
              background: 'none',
              border: 'none',
              borderTop: activeTab === 'exams' ? '1px solid var(--text-primary)' : '1px solid transparent',
              marginTop: -1,
              padding: '16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: activeTab === 'exams' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            <FileText size={12} /> Exams
          </button>
        </div>

        {/* Content Area */}
        <div style={{ marginTop: 24 }}>
          {activeTab === 'articles' ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {seoPages.map((page, idx) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '16px 0',
                    borderBottom: idx === seoPages.length - 1 ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    transition: 'all 0.2s'
                  }} className="group hover:translate-x-1">
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BookOpen size={20} color="var(--accent)" opacity={0.6} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'color 0.2s'
                      }} className="group-hover:text-accent">
                        {page.title}
                      </h3>
                    </div>
                    <ArrowRight size={16} color="var(--accent)" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
              {seoPages.length === 0 && (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No articles published yet.
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {exams.map((exam, idx) => (
                <Link
                  key={exam.id}
                  href={`/exam/${exam.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '16px 0',
                    borderBottom: idx === exams.length - 1 ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    transition: 'all 0.2s'
                  }} className="group hover:translate-x-1">
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div className={`status-dot status-${exam.status}`} style={{ width: 10, height: 10 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {cleanLabel(exam.status)}
                        </span>
                      </div>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {exam.shortTitle || exam.title}
                      </h3>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      background: 'rgba(124, 58, 237, 0.05)',
                      transition: 'all 0.2s'
                    }} className="group-hover:bg-accent group-hover:color-white">
                      View
                    </div>
                  </div>
                </Link>
              ))}
              {exams.length === 0 && (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No exams assigned yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--bg-secondary);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .group:hover .group-hover\\:bg-accent {
          background: var(--accent);
          color: white !important;
        }
        .opacity-0 { opacity: 0; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1; }
      `}</style>
    </div>
  );
}
