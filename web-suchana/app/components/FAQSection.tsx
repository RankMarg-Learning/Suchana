'use client';

import React, { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FAQSection({ faqs, title = "Frequently Asked Questions" }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="faq-section" style={{ margin: '48px 0', borderTop: '1px solid var(--border)', paddingTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <MessageCircleQuestion size={20} color="var(--accent)" style={{ display: "inline", verticalAlign: "middle" }} />
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          margin: 0,
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          letterSpacing: '-0.3px'
        }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className={`faq-item-container ${isOpen ? 'active' : ''}`}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isOpen ? '0 4px 20px -5px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  gap: 16
                }}
              >
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                  lineHeight: 1.5,
                  transition: 'color 0.2s ease'
                }}>
                  {faq.question}
                </span>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: isOpen ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0
                  }} 
                />
              </button>
              
              <div 
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ minHeight: 0 }}>
                  <div style={{ 
                    padding: '0 20px 16px', 
                    color: 'var(--text-secondary)', 
                    fontSize: '14px',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border)',
                    paddingTop: 16,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'all 0.3s ease'
                  }}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
