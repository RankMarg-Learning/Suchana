"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, MapPin, Target, GraduationCap, Briefcase, Search,
  Rocket, ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import { checkUserByPhone, registerUser } from "../lib/api";
import { CATEGORIES } from "../lib/types";

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh"
];

const DEGREES = [
  "B.Tech", "B.E", "Diploma", "B.Sc", "M.Sc", "B.Com", "M.Com", "B.A", "M.A", "B.Ed", "LLB", "MBBS", "BCA", "MCA", "ITI", "Other"
];

const SPECIALIZATIONS = [
  "Computer Science", "Civil", "Mechanical", "Electrical", "Electronics", "IT", "General Science", "Maths", "Physics", "Chemistry", "Biology", "Agriculture", "Commerce", "Economics", "History", "Geography", "Polity", "English", "Other"
];

const STEPS = [
  { label: "Identity", icon: User },
  { label: "Location", icon: MapPin },
  { label: "Interests", icon: Target },
  { label: "Profile", icon: GraduationCap },
  { label: "Specialisation", icon: Search },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [qualification, setQualification] = useState("");
  const [degree, setDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [employment, setEmployment] = useState("");
  const [gender, setGender] = useState("");

  const StepIcon = STEPS[step].icon;

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0 && /^\d{10}$/.test(phone);
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 0) {
      setLoading(true);
      try {
        const res = await checkUserByPhone(phone.trim());
        if (res.isRegistered && res.data) {
          localStorage.setItem("@suchana_userId", res.data.id);
          router.push("/");
          return;
        }
      } catch (err) {
        // Continue if checking fails
      } finally {
        setLoading(false);
      }
    }
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    if (!name.trim() || !phone.trim() || !/^\d{10}$/.test(phone)) return;
    setLoading(true);
    try {
      const user = await registerUser({
        name: name.trim(),
        phone: phone.trim(),
        state: state || undefined,
        preferredCategories: categories,
        qualification: qualification || undefined,
        degree: degree.trim() || undefined,
        specialization: specialization.trim() || undefined,
        employmentStatus: employment || undefined,
        gender: gender || undefined,
        platform: "WEB",
      });
      localStorage.setItem("@suchana_userId", user.id);
      router.push("/");
    } catch (e: any) {
      alert(e.message || "Failed to create profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-root">
      <div className="app-shell" style={{ maxWidth: 640, margin: "auto", minHeight: "100vh", display: "flex", flexDirection: "column", padding: "40px 20px" }}>
        
        {/* Top Progress & Skip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {STEPS.map((_, i) => (
              <div key={i} className={`progress-dot ${i <= step ? "active" : ""}`} />
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => router.push("/")}>Skip</button>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <StepIcon size={28} color="var(--accent-light)" />
          <h1 style={{ fontSize: 26, margin: 0, fontWeight: 800 }}>{STEPS[step].label}</h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Optional · for personalised exam recommendations</p>

        {/* Form Body */}
        <div style={{ flex: 1 }}>
          {step === 0 && (
            <div className="onb-slide">
              <label className="onb-label">Your Name</label>
              <input 
                className="onb-input" 
                placeholder="Ravi Kumar"
                value={name} onChange={(e) => setName(e.target.value)} 
              />

              <label className="onb-label">Mobile Number</label>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div className="onb-input-prefix">+91</div>
                <input 
                  className="onb-input" style={{ flex: 1, marginBottom: 0 }}
                  placeholder="9876543210" maxLength={10} type="tel"
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <p className="onb-hint">Your number is your identity — no OTP needed. We'll use it to sync your profile across devices.</p>
            </div>
          )}

          {step === 1 && (
            <div className="onb-slide">
              <label className="onb-label">Select your State / UT</label>
              <div className="onb-grid">
                {INDIA_STATES.map((s) => (
                  <button 
                    key={s} 
                    className={`onb-chip ${state === s ? "active" : ""}`}
                    onClick={() => setState(state === s ? "" : s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onb-slide">
              <label className="onb-label">Which exams are you preparing for?</label>
              <p className="onb-sublabel">Select all that apply</p>
              <div className="onb-grid">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    className={`onb-chip ${categories.includes(c.value) ? "active" : ""}`}
                    onClick={() => toggleCategory(c.value)}
                  >
                    <span style={{ marginRight: 6 }}>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onb-slide">
              <label className="onb-label">Gender</label>
              <div className="onb-row">
                {[{ v: "MALE", l: "Male" }, { v: "FEMALE", l: "Female" }, { v: "OTHER", l: "Other" }].map((g) => (
                  <button key={g.v} className={`onb-btn ${gender === g.v ? "active" : ""}`} onClick={() => setGender(gender === g.v ? "" : g.v)}>
                    <User size={14} style={{ marginRight: 6 }} /> {g.l}
                  </button>
                ))}
              </div>

              <label className="onb-label">Qualification</label>
              <div className="onb-row">
                {[{ v: "TEN_PASS", l: "10th" }, { v: "TWELVE_PASS", l: "12th" }, { v: "GRADUATE", l: "Graduate" }, { v: "POST_GRADUATE", l: "PG" }].map((q) => (
                  <button key={q.v} className={`onb-btn ${qualification === q.v ? "active" : ""}`} onClick={() => setQualification(qualification === q.v ? "" : q.v)}>
                    {q.l}
                  </button>
                ))}
              </div>

              <label className="onb-label">Employment Status</label>
              <div className="onb-row">
                {[{ v: "STUDENT", l: "Student", i: GraduationCap }, { v: "EMPLOYED", l: "Employed", i: Briefcase }, { v: "UNEMPLOYED", l: "Job Seeking", i: Search }].map((e) => {
                  const Icon = e.i;
                  return (
                    <button key={e.v} className={`onb-btn ${employment === e.v ? "active" : ""}`} onClick={() => setEmployment(employment === e.v ? "" : e.v)}>
                      <Icon size={14} style={{ marginRight: 6 }} /> {e.l}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onb-slide">
              <label className="onb-label">Your Degree / Diploma</label>
              <div className="onb-grid">
                {DEGREES.map((d) => (
                  <button key={d} className={`onb-chip ${degree === d ? "active" : ""}`} onClick={() => setDegree(degree === d ? "" : d)}>
                    {d}
                  </button>
                ))}
              </div>

              <label className="onb-label" style={{ marginTop: 24 }}>Branch / Specialisation</label>
              <div className="onb-grid">
                {SPECIALIZATIONS.map((s) => (
                  <button key={s} className={`onb-chip ${specialization === s ? "active" : ""}`} onClick={() => setSpecialization(specialization === s ? "" : s)}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="onb-hint" style={{ marginTop: 16 }}>
                Help us show you exact "Job Roles" that match your {degree || "Degree"} {specialization ? `in ${specialization}` : ""}.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          {step > 0 && (
            <button className="onb-nav-btn back" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={18} /> Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button className="onb-nav-btn next" onClick={handleNext} disabled={!canProceed() || loading}>
              {loading ? <RefreshCw size={18} className="spin-icon" /> : <>Next <ChevronRight size={18} /></>}
            </button>
          ) : (
            <button className="onb-nav-btn next" onClick={handleFinish} disabled={loading}>
              {loading ? <RefreshCw size={18} className="spin-icon" /> : <>Let's Go <Rocket size={18} style={{ marginLeft: 8 }} /></>}
            </button>
          )}
        </div>

      </div>

      <style jsx global>{`
        .onboarding-root { background: var(--bg-deep); min-height: 100vh; color: var(--text-main); }
        .progress-dot { width: 8px; height: 8px; border-radius: 4px; background: var(--surface-light); transition: 0.3s ease; }
        .progress-dot.active { width: 24px; background: var(--accent); }
        .onb-label { display: block; color: var(--text-muted); font-size: 13px; font-weight: 600; margin-bottom: 8px; margin-top: 16px; }
        .onb-sublabel { color: var(--text-dim); font-size: 12px; margin-top: -6px; margin-bottom: 12px; }
        .onb-hint { color: var(--text-dim); font-size: 12px; line-height: 1.5; }
        .onb-input {
          width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 14px 16px; color: var(--text-main); font-size: 16px; margin-bottom: 16px; outline: none;
        }
        .onb-input:focus { border-color: var(--accent); }
        .onb-input-prefix {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 14px 16px; display: flex; align-items: center; color: var(--text-muted); font-size: 16px;
        }
        .onb-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .onb-chip {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 8px 12px; color: var(--text-muted); font-size: 13px; cursor: pointer;
          transition: all 0.2s ease; display: inline-flex; align-items: center;
        }
        .onb-chip:hover { border-color: rgba(124, 58, 237, 0.4); }
        .onb-chip.active { background: #3b0764; border-color: var(--accent); color: var(--accent-light); font-weight: 700; }
        .onb-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .onb-btn {
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
          padding: 10px 14px; color: var(--text-muted); font-size: 13px; cursor: pointer;
          display: inline-flex; align-items: center; transition: all 0.2s ease;
        }
        .onb-btn.active { background: #3b0764; border-color: var(--accent); color: var(--accent-light); font-weight: 700; }
        .onb-nav-btn {
          border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; outline: none; border: none; transition: 0.2s;
        }
        .onb-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .onb-nav-btn.back { flex: 1; background: var(--surface); color: var(--text-muted); border: 1px solid var(--border); }
        .onb-nav-btn.back:hover { background: var(--surface-light); }
        .onb-nav-btn.next { flex: 2; background: var(--accent); color: #fff; }
        .onb-nav-btn.next:hover { background: #6d28d9; }
        .onb-slide { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
