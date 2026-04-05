import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: "Browse Exams by State | Exam Suchana",
    description: "Find government exam notifications, results and admit cards organized by Indian states and union territories.",
};

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Chandigarh",
    "Puducherry", "Ladakh"
].sort();

export default function StateDirectoryPage() {
    return (
        <main className="min-h-screen  pb-20">
            <div className="container">
                {/* Section Header */}
                <div className="pt-12 pb-8">
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        State Directory
                    </div>
                    <h1 className="section-title" style={{ fontSize: '36px', marginBottom: '8px' }}>
                        Exams by <span className="text-accent">State</span>
                    </h1>
                    <p className="footer-brand-desc" style={{ maxWidth: '600px', fontSize: '16px' }}>
                        Select your region to view localized government job alerts and exam schedules.
                    </p>
                </div>

                {/* Grid of List Rows (3-col Desktop, 1-col Mobile) */}
                <div className="features-grid" style={{ marginTop: '20px' }}>
                    {STATES.map((state) => (
                        <Link
                            key={state}
                            href={`/state/${state.toLowerCase().replace(/ /g, "-")}`}
                            className="exam-list-row compact-row"
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: 'var(--accent-light)', opacity: 0.8 }}>
                                    <MapPin size={16} />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {state}
                                </span>
                            </div>
                            <ChevronRight size={14} color="var(--text-muted)" opacity={0.6} />
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
