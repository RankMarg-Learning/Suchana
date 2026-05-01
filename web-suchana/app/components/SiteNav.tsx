"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { EXAM_CATEGORIES } from "../lib/enums";
import { enumToSlug, cleanLabel } from "../lib/types";

export default function SiteNav({ trendingExams = [] }: { trendingExams?: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="font-bold text-[18px] tracking-tight text-slate-900">
              ExamSuchana
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 text-[15px] font-medium text-slate-600">
              <div className="relative group/nav py-4">
                <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                  Updates <ChevronDown size={14} className="group-hover/nav:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 rounded-md shadow-md opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 p-1 flex flex-col text-[14px]">
                  <Link href="/topic/notification" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Notifications</Link>
                  <Link href="/topic/result" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Results</Link>
                  <Link href="/topic/admit-card" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Admit Cards</Link>
                  <Link href="/topic/answer-key" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Answer Keys</Link>
                </div>
              </div>

              <div className="relative group/nav py-4">
                <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                  Resources <ChevronDown size={14} className="group-hover/nav:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-slate-200 rounded-md shadow-md opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 p-1 flex flex-col text-[14px]">
                  <Link href="/topic/syllabus" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Syllabus</Link>
                  <Link href="/topic/preparation-strategy" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Preparation Strategy</Link>
                  <Link href="/topic/previous-year-paper" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Previous Papers</Link>
                  <Link href="/topic/books" className="px-3 py-2 rounded-sm hover:bg-slate-100 text-slate-700">Best Books</Link>
                </div>
              </div>
              <Link href="/topic/news" className="hover:text-slate-900 transition-colors py-4">News</Link>
              <Link href="/topic/guide" className="hover:text-slate-900 transition-colors py-4">Guide</Link>
              <Link href="/categories" className="hover:text-slate-900 transition-colors py-4">All Exams</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {mounted && (
                <Link
                  href="/onboarding"
                  className="hidden lg:flex items-center justify-center px-4 py-2 border border-slate-200 rounded-md text-[14px] font-medium hover:bg-slate-100 text-slate-900 transition-colors"
                >
                  <Bell size={16} className="mr-2" /> Register
                </Link>
              )}

              {/* Mobile Actions */}
              <button
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Accordion Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-white border-b border-slate-200 shadow-sm overflow-y-auto max-h-[85vh]">
            <div className="px-4 py-2 flex flex-col space-y-1 pb-8">

              <Link href="/onboarding" className="flex items-center px-4 py-3 border border-slate-200 rounded-md text-[15px] font-medium mt-3 mb-2 justify-center transition-colors hover:bg-slate-100" onClick={() => setMobileMenuOpen(false)}>
                <Bell size={16} className="mr-2" /> Get Notified
              </Link>

              {/* Updates Accordion */}
              <div className="border-b border-slate-100">
                <button className="w-full flex items-center justify-between py-4 text-[15px] font-medium text-slate-900" onClick={() => toggleAccordion('updates')}>
                  Updates <ChevronDown size={16} className={`text-slate-500 transition-transform ${openAccordion === 'updates' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'updates' && (
                  <div className="flex flex-col pb-4 pl-4 space-y-4 text-[15px] font-medium text-slate-600">
                    <Link href="/topic/notification" onClick={() => setMobileMenuOpen(false)}>Notifications</Link>
                    <Link href="/topic/result" onClick={() => setMobileMenuOpen(false)}>Results</Link>
                    <Link href="/topic/admit-card" onClick={() => setMobileMenuOpen(false)}>Admit Cards</Link>
                    <Link href="/topic/answer-key" onClick={() => setMobileMenuOpen(false)}>Answer Keys</Link>
                  </div>
                )}
              </div>

              {/* Resources Accordion */}
              <div className="border-b border-slate-100">
                <button className="w-full flex items-center justify-between py-4 text-sm font-medium text-slate-900" onClick={() => toggleAccordion('resources')}>
                  Resources <ChevronDown size={16} className={`text-slate-500 transition-transform ${openAccordion === 'resources' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'resources' && (
                  <div className="flex flex-col pb-4 pl-4 space-y-4 text-[15px] font-medium text-slate-600">
                    <Link href="/topic/syllabus" onClick={() => setMobileMenuOpen(false)}>Syllabus</Link>
                    <Link href="/topic/preparation-strategy" onClick={() => setMobileMenuOpen(false)}>Preparation Strategy</Link>
                    <Link href="/topic/previous-year-paper" onClick={() => setMobileMenuOpen(false)}>Previous Papers</Link>
                    <Link href="/topic/tool" onClick={() => setMobileMenuOpen(false)}>Tools</Link>
                    <Link href="/topic/current-affairs" onClick={() => setMobileMenuOpen(false)}>Current Affairs</Link>
                  </div>
                )}
              </div>

              {/* Categories Accordion */}
              <div className="border-b border-slate-100">
                <button className="w-full flex items-center justify-between py-4 text-sm font-medium text-slate-900" onClick={() => toggleAccordion('categories')}>
                  Browse All Categories <ChevronDown size={16} className={`text-slate-500 transition-transform ${openAccordion === 'categories' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'categories' && (
                  <div className="flex flex-col pb-4 pl-4 space-y-4 text-[15px] font-medium text-slate-600">
                    {EXAM_CATEGORIES.map((cat) => (
                      <Link key={cat} href={`/c/${enumToSlug(cat)}`} onClick={() => setMobileMenuOpen(false)} className="capitalize pb-1">{cleanLabel(cat)}</Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/topic/guide" className="py-4 text-sm font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                Guide
              </Link>
              <Link href="/topic/news" className="py-4 text-sm font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                News
              </Link>
              <Link href="/categories" className="py-4 text-sm font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                All Exams
              </Link>

            </div>
          </div>
        )}
      </nav>

      {/* Marquee Banner fixed just under the top navbar */}
      {trendingExams && trendingExams.length > 0 && (
        <div className="live-update-wrapper">
          <div className="live-update-marquee-container">
            <div className="live-update-marquee">
              {[...Array(4)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex shrink-0 items-center">
                  {trendingExams.map((exam) => (
                    <span key={`${groupIdx}-${exam.id}`} className="live-update-item">
                      <span className="live-update-status">{cleanLabel(exam.status)}</span>
                      <Link href={`/exam/${exam.slug}`} className="live-update-title">
                        {exam.shortTitle || exam.title}
                      </Link>
                      <span className="live-update-separator">•</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacers */}
      <div className="h-[56px]" />
      <div className={`${trendingExams && trendingExams.length > 0 ? "h-[36px]" : "h-0"}`} />
    </>
  );
}
