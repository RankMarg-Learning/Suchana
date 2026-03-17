import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exam Suchana — Government Exam Lifecycle Tracker",
  description:
    "Track every stage of Indian government exams — registration, admit card, results — all in one place. Get personalized notifications so you never miss a deadline.",
  keywords: [
    "government exam",
    "UPSC",
    "SSC",
    "railway exam",
    "banking exam",
    "exam timeline",
    "admit card",
    "result notification",
    "sarkari naukri",
    "suchana",
  ],
  openGraph: {
    title: "Exam Suchana — Government Exam Lifecycle Tracker",
    description:
      "Never miss a government exam deadline. Track registration, admit cards, and results with real-time notifications.",
    type: "website",
    locale: "en_IN",
    siteName: "Exam Suchana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Suchana — Government Exam Lifecycle Tracker",
    description: "Track all government exam timelines in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
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
