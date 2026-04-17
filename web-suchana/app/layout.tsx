import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "./lib/api";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Exam Suchana — Sarkari Result ${currentYear} | Latest Govt Jobs & Tracker`,
    template: `%s | Exam Suchana`,
  },
  description:
    `Get real-time updates for latest government jobs, exam notifications, admit cards, and results. Track every government exam lifecycle with precision on Exam Suchana — India's Official Exam Tracker.`,
  keywords: [
    "Exam Suchana",
    "government exam notifications",
    "sarkari naukri total updates",
    `UPSC CSE ${currentYear} tracker`,
    `SSC CGL ${currentYear} notifications`,
    `RRB NTPC ${currentYear} updates`,
    `IBPS PO ${currentYear} dates`,
    `SBI PO notification ${currentYear}`,
    `Sarkari Result ${currentYear}`,
    "Sarkari Naukri Notification",
    `Govt Job Bharti ${currentYear}`,
    "Exam Pariksha Updates",
    "Direct Official Apply Link",
    "Admit Card Download Link",
    "Result Kab Aayega",
    "CBT Exam Schedule",
    "State Govt Jobs India",
    "UPSC Syllabus PDF Download",
    "SSC Exam Calendar",
    "Banking Job Alerts",
    "Railway Recruitment Board Updates",
    `Defense Job Bharti ${currentYear}`,
    `Police Recruitment ${currentYear} India`,
    "Exam Suchana Official Website",
    "Govt Job Life Cycle Tracker"
  ],
  authors: [{ name: "Exam Suchana", url: SITE_URL }],
  creator: "Exam Suchana",
  publisher: "Exam Suchana",
  category: "Education",
  classification: "Government Exam Tracker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Exam Suchana",
    title: "Exam Suchana — Get Direct Official Links for Govt Exams",
    description:
      "Tracking UPSC, SSC, Banking, Railway & State Govt exams? Get real-time alerts for apply links, admit cards, and merit lists only on Exam Suchana.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Exam Suchana — Real-time Govt Exam Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ExamSuchana",
    creator: "@ExamSuchana",
    title: "Exam Suchana — Fast Govt Exam Alerts",
    description:
      "UPSC, SSC, Railway, Banking. Real-time lifecycle tracking from Notification to Result. Direct official links included.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    languages: {
      "en-IN": SITE_URL,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#7c3aed",
    "og:locale:alternate": "hi_IN",
    "geo.region": "IN",
    "geo.placename": "India",
    "DC.title": "Exam Suchana - India's Government Exam Lifecycle Tracker",
  },
  manifest: "/manifest.json",
};

// ─── Website & Organization JSON-LD ──────────────────────────────────────────

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Exam Suchana",
  alternateName: "ExamSuchana",
  url: SITE_URL,
  description:
    `India's most comprehensive government exam lifecycle tracker. Track registration, admit card, exam date, and results for UPSC, SSC, Railway, Banking and more in ${currentYear}.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Exam Suchana",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  sameAs: [
    "https://t.me/ExamSuchana",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "help@examsuchana.in",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
  },
};

import Providers from "./components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="google-adsense-account" content="ca-pub-6631120605146752" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <Providers>
          <SiteNav />
          {children}
          <SiteFooter />
        </Providers>
        {process.env.NODE_ENV === "production" && (
          <>

            <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1SHT5DRT85" />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-1SHT5DRT85');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
