"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Exam, STATUS_LABELS, cleanLabel } from "../lib/types";

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
      className="exam-list-row"
      aria-label={`View ${exam.shortTitle ?? exam.title} details`}
    >
      {/* Left: Title & body */}
      <div className="exam-row-main">
        <div className="exam-row-tags">
          <span className={`exam-tag level-${(exam.examLevel ?? "national").toLowerCase()}`}>
            {cleanLabel(exam.examLevel)}
          </span>
          <span className={`exam-tag cat-${(exam.category ?? "").toLowerCase()}`}>
            {cleanLabel(exam.category)}
          </span>
          {exam.state && (
            <span className="exam-tag">
              <MapPin size={9} style={{ display: "inline", marginRight: 2 }} />{exam.state}
            </span>
          )}
        </div>
        <h2 className="exam-row-title">{exam.shortTitle ?? exam.title}</h2>
        <div className="exam-row-body">{exam.conductingBody}</div>
      </div>

      {/* Right: Status + arrow */}
      <div className="exam-row-right">
        <div className="status-container">
          <StatusBadge status={exam.status} />
        </div>
        <div className="exam-row-arrow">
          Details <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: 140 }} />
        <div className="skeleton" style={{ height: 12, width: 120 }} />
      </div>
      <div className="skeleton" style={{ height: 28, width: 130, borderRadius: 100 }} />
    </div>
  );
}
