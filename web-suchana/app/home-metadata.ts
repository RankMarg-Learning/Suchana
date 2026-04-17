import { Metadata } from "next";
import { SITE_URL } from "./lib/api";

export const metadata: Metadata = {
  title: "Government Exam Notifications 2026 — Registration, Dates & Results",
  description:
    "Track 1000+ Indian government exam notifications in one place. Live registration status, admit card alerts, exam dates and result updates for UPSC, SSC CGL, RRB NTPC, IBPS PO, NDA, CTET and more.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Government Exam Notifications 2026 — Exam Suchana",
    description:
      "Live government exam tracker: registration, admit card, exam dates, results for UPSC, SSC, Railway, Banking, Defence exams.",
    url: SITE_URL,
    type: "website",
  },
};
