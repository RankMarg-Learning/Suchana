"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Exam, STATUS_LABELS, cleanLabel } from "../lib/types";
import { trackFunnelStep } from "../lib/telemetry";

export function StatusBadge({ status }: { status: string }) {
  return (
    <div className={`status-badge status-${status}`}>
      <div className="status-dot" />
      {STATUS_LABELS[status] ?? cleanLabel(status)}
    </div>
  );
}

export function ExamListRow({ exam }: { exam: Exam }) {
  const isCentral = !exam.state || exam.state.toLowerCase() === "central" || exam.state.toLowerCase() === "all";

  // Find registration lifecycle events to extract dates cleanly
  const registrationEvent = exam.lifecycleEvents?.find(e => e.stage === "REGISTRATION");
  const startDate = registrationEvent?.startsAt;
  const endDate = registrationEvent?.endsAt;

  return (
    <Link
      href={`/exam/${exam.slug}`}
      className="exam-card-modern"
      aria-label={`View ${exam.shortTitle ?? exam.title} details`}
      onClick={() => trackFunnelStep('exam_discovery_click', {
        exam_id: exam.id,
        exam_slug: exam.slug,
        exam_title: exam.shortTitle || exam.title
      })}
    >
      {/* Top Meta Line: Tags & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Tag */}
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--accent)',
            background: 'rgba(124,58,237,0.06)',
            padding: '2px 8px',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {cleanLabel(exam.category)}
          </span>

          {/* Geography Tag */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            background: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '100px'
          }}>
            <MapPin size={10} />
            {isCentral ? "Central" : exam.state}
          </span>

          {/* Conducting Body */}
          {exam.conductingBody && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              borderLeft: '1px solid var(--border)',
              paddingLeft: '8px'
            }}>
              {exam.conductingBody.toUpperCase()}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <StatusBadge status={exam.status} />
      </div>

      {/* Middle Line: Title & Arrow */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontFamily: 'var(--hd)',
            fontWeight: 800,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            transition: 'color 0.2s'
          }} className="exam-row-title">
            {exam.title}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#f9fafb',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
          flexShrink: 0,
          transition: 'all 0.2s'
        }} className="exam-arrow-circle">
          <ArrowRight size={15} />
        </div>
      </div>

      {/* Bottom Line: Quick dates if available */}
      {(startDate || endDate) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 16px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '12px',
          marginTop: '4px'
        }}>
          {startDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} className="text-purple-400" />
              Starts: <strong style={{ color: 'var(--ink)' }}>{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
            </span>
          )}
          {endDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} className="text-red-400" />
              Deadline: <strong style={{ color: 'var(--ink)' }}>{new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      minHeight: '120px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton" style={{ height: 18, width: 60, borderRadius: 100 }} />
          <div className="skeleton" style={{ height: 18, width: 80, borderRadius: 100 }} />
        </div>
        <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div className="skeleton" style={{ height: 22, width: '70%' }} />
        <div className="skeleton" style={{ height: 32, width: 32, borderRadius: '50%' }} />
      </div>
    </div>
  );
}
