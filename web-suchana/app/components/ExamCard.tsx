"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  return (
    <Link
      href={`/exam/${exam.slug}`}
      className="exam-list-row compact-row"
      aria-label={`View ${exam.shortTitle ?? exam.title} details`}
      onClick={() => trackFunnelStep('exam_discovery_click', { 
        exam_id: exam.id, 
        exam_slug: exam.slug,
        exam_title: exam.shortTitle || exam.title 
      })}
    >
      <div className="exam-row-main">
        <h2 className="exam-row-title">{exam.title}</h2>
        <div className="exam-row-body">{cleanLabel(exam.category)}</div>
      </div>

      <div className="exam-row-right">
        <StatusBadge status={exam.status} />
        <ArrowRight size={14} className="exam-row-arrow" />
      </div>
    </Link>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row compact-row">
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "30%" }} />
      </div>
      <div className="skeleton" style={{ height: 26, width: 80, borderRadius: 100 }} />
    </div>
  );
}
