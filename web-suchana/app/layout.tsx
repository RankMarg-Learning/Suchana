import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "./lib/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Exam Suchana — Government Exam Notifications & Lifecycle Tracker",
    template: "%s | Exam Suchana",
  },
  description:
    "Track every stage of 1000+ Indian government exams — registration dates, admit cards, exam dates, answer keys and results — all in one place. Never miss a sarkari naukri deadline.",
  keywords: [
    "government exam notifications",
    "sarkari naukri 2025",
    "UPSC CSE 2025",
    "SSC CGL 2025",
    "RRB NTPC 2025",
    "IBPS PO 2025",
    "exam registration dates",
    "admit card download",
    "exam result notification",
    "government job alerts",
    "sarkari exam calendar",
    "India government exam tracker",
    "suchana",
    "exam suchana",
    "exam timeline",
    "banking exam 2025",
    "railway exam 2025",
    "defence exam 2025",
    "UPSC exam date",
    "SSC exam date",
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
    title: "Exam Suchana — Government Exam Notifications & Lifecycle Tracker",
    description:
      "Never miss a government exam deadline. Get registration dates, admit card alerts, exam schedules and result notifications for UPSC, SSC, Railway, Banking and more.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Exam Suchana — Government Exam Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ExamSuchana",
    creator: "@ExamSuchana",
    title: "Exam Suchana — Government Exam Notifications",
    description:
      "Track UPSC, SSC, Railway, Banking exam timelines in one place. Get instant alerts for registration, admit cards & results.",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
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
      { url: "/examsuchana-logoT.png", sizes: "192x192", type: "image/png" },
      { url: "/examsuchana-logoT.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/examsuchana-logoT.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#7c3aed",
    "og:locale:alternate": "hi_IN",
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
    "India's most comprehensive government exam lifecycle tracker. Track registration, admit card, exam date, and results for UPSC, SSC, Railway, Banking and more.",
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
  logo: `${SITE_URL}/examsuchana-logoT.png`,
  sameAs: [
    "https://twitter.com/ExamSuchana",
    "https://t.me/ExamSuchana",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "help@examsuchana.in",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#7c3aed" />

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
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1SHT5DRT85" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1SHT5DRT85');
          `}
        </Script>
      </body>
    </html>
  );
}
