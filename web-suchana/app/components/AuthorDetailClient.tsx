"use client";

import React, { useState } from 'react';
import { Author, Exam, SeoPage, cleanLabel } from '../lib/types';
import Link from 'next/link';
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Coins, 
  Wrench 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuthorBySlug } from '../lib/api';
import { ExamListRow } from './ExamCard';

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
      <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px', opacity: 0.2 }}>
        <div className="page-grid">
          <div className="content-col">
            <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: '8px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '4px' }} />
              ))}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!author || 'error' in author) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2 style={{ color: 'var(--ink)', fontWeight: 800 }}>Author Not Found</h2>
        <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go Home</Link>
      </div>
    );
  }

  const { name, image, designation, bio, exams = [], seoPages = [] } = author;

  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* AUTHOR BIO CARD */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'center', 
            background: '#fff', 
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            padding: '24px', 
            marginBottom: '32px', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '2px solid var(--accent)', 
              flexShrink: 0 
            }}>
              <img
                src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--hd)', fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                  {name}
                </h1>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  background: 'rgba(124, 58, 237, 0.08)', 
                  padding: '2px 8px', 
                  borderRadius: '100px', 
                  border: '1px solid rgba(124, 58, 237, 0.15)' 
                }}>
                  <CheckCircle size={12} fill="var(--accent)" color="white" />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>
                {designation || 'Senior Editor & Career Coach'}
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                {bio}
              </p>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '24px', marginBottom: '24px' }}>
            <button
              onClick={() => setActiveTab('articles')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'articles' ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '12px 4px',
                fontSize: '14px',
                fontWeight: activeTab === 'articles' ? 800 : 600,
                color: activeTab === 'articles' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} /> Published Articles ({seoPages.length})
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'exams' ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '12px 4px',
                fontSize: '14px',
                fontWeight: activeTab === 'exams' ? 800 : 600,
                color: activeTab === 'exams' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <GraduationCap size={16} /> Curated Exams ({exams.length})
            </button>
          </div>

          {/* TAB CONTENT */}
          <div>
            {activeTab === 'articles' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {seoPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="art-wide"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="aw-thumb" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5ff', borderRight: '1px solid var(--border)', color: 'var(--accent)', padding: '24px' }}>
                      <FileText size={32} />
                    </div>
                    <div className="aw-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {cleanLabel(page.category || "Guide")}
                      </span>
                      <h3 style={{
                        fontFamily: 'var(--hd)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        margin: 0,
                        lineHeight: 1.3
                      }}>
                        {page.title}
                      </h3>
                      {page.updatedAt && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Updated: {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {seoPages.length === 0 && (
                  <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                    No articles published yet.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {exams.map((exam) => (
                  <ExamListRow key={exam.id} exam={exam} />
                ))}
                {exams.length === 0 && (
                  <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                    No exams curated yet.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* PROFILE STATS */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <CheckCircle size={16} className="text-purple-500" /> Editorial Stats
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Role</span>
                  <strong style={{ color: 'var(--ink)' }}>{designation || "Senior Editor"}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Articles</span>
                  <strong style={{ color: 'var(--ink)' }}>{seoPages.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Exams Curated</span>
                  <strong style={{ color: 'var(--ink)' }}>{exams.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ASPIRANT TOOLSET */}
          <div className="sw">
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
