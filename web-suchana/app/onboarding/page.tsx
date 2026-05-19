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
    <div className="onboarding-root" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Top Progress & Skip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '28px' }}>
          <div style={{ display: "flex", gap: '6px' }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i <= step ? 'var(--accent)' : 'var(--border)',
                  transition: '0.3s ease',
                }}
              />
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(124,58,237,0.06)', color: 'var(--accent)' }}>
            <StepIcon size={20} />
          </div>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--hd)' }}>
            {STEPS[step].label}
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: '13.5px', marginBottom: '28px', margin: '0 0 28px 0' }}>
          Optional · for personalised exam recommendations
        </p>

        {/* Form Body */}
        <div style={{ flex: 1 }}>
          {step === 0 && (
            <div className="onb-slide">
              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Your Name</label>
              <input 
                className="onb-input" 
                placeholder="Ravi Kumar"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  color: 'var(--ink)',
                  fontSize: '15px',
                  marginBottom: '20px',
                  outline: 'none',
                }}
              />

              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Mobile Number</label>
              <div style={{ display: "flex", gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  +91
                </div>
                <input 
                  className="onb-input" 
                  placeholder="9876543210" 
                  maxLength={10} 
                  type="tel"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  style={{
                    flex: 1,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    color: 'var(--ink)',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Your number is your identity — no OTP needed. We'll use it to sync your profile across devices.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="onb-slide">
              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px' }}>Select your State / UT</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {INDIA_STATES.map((s) => {
                  const isSelected = state === s;
                  return (
                    <button 
                      key={s} 
                      onClick={() => setState(isSelected ? "" : s)}
                      style={{
                        background: isSelected ? 'var(--accent)' : '#fff',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        color: isSelected ? '#fff' : 'var(--text2)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onb-slide">
              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px' }}>Which exams are you preparing for?</label>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 16px 0' }}>Select all that apply</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CATEGORIES.map((c) => {
                  const isSelected = categories.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      onClick={() => toggleCategory(c.value)}
                      style={{
                        background: isSelected ? 'var(--accent)' : '#fff',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        color: isSelected ? '#fff' : 'var(--text2)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{c.icon}</span> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onb-slide" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Gender</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ v: "MALE", l: "Male" }, { v: "FEMALE", l: "Female" }, { v: "OTHER", l: "Other" }].map((g) => {
                    const isSelected = gender === g.v;
                    return (
                      <button
                        key={g.v}
                        onClick={() => setGender(isSelected ? "" : g.v)}
                        style={{
                          background: isSelected ? 'var(--accent)' : '#fff',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '10px 14px',
                          color: isSelected ? '#fff' : 'var(--text2)',
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <User size={13} /> {g.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Qualification</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[{ v: "TEN_PASS", l: "10th" }, { v: "TWELVE_PASS", l: "12th" }, { v: "GRADUATE", l: "Graduate" }, { v: "POST_GRADUATE", l: "PG" }].map((q) => {
                    const isSelected = qualification === q.v;
                    return (
                      <button
                        key={q.v}
                        onClick={() => setQualification(isSelected ? "" : q.v)}
                        style={{
                          background: isSelected ? 'var(--accent)' : '#fff',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '10px 14px',
                          color: isSelected ? '#fff' : 'var(--text2)',
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {q.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Employment Status</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[{ v: "STUDENT", l: "Student", i: GraduationCap }, { v: "EMPLOYED", l: "Employed", i: Briefcase }, { v: "UNEMPLOYED", l: "Job Seeking", i: Search }].map((e) => {
                    const isSelected = employment === e.v;
                    const Icon = e.i;
                    return (
                      <button
                        key={e.v}
                        onClick={() => setEmployment(isSelected ? "" : e.v)}
                        style={{
                          background: isSelected ? 'var(--accent)' : '#fff',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '10px 14px',
                          color: isSelected ? '#fff' : 'var(--text2)',
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Icon size={13} /> {e.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onb-slide">
              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Your Degree / Diploma</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {DEGREES.map((d) => {
                  const isSelected = degree === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDegree(isSelected ? "" : d)}
                      style={{
                        background: isSelected ? 'var(--accent)' : '#fff',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        color: isSelected ? '#fff' : 'var(--text2)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <label className="onb-label" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', marginTop: '24px' }}>Branch / Specialisation</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {SPECIALIZATIONS.map((s) => {
                  const isSelected = specialization === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSpecialization(isSelected ? "" : s)}
                      style={{
                        background: isSelected ? 'var(--accent)' : '#fff',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        color: isSelected ? '#fff' : 'var(--text2)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '16px', margin: '16px 0 0 0' }}>
                Help us show you exact &quot;Job Roles&quot; that match your {degree || "Degree"} {specialization ? `in ${specialization}` : ""}.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: '12px', marginTop: '36px', borderTop: "1px solid var(--border)", paddingTop: '24px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1,
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                color: 'var(--text2)',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              style={{
                flex: 2,
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                padding: '12px',
                color: '#fff',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                opacity: (!canProceed() || loading) ? 0.5 : 1,
              }}
            >
              {loading ? <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> : <>Next <ChevronRight size={16} /></>}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{
                flex: 2,
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                padding: '12px',
                color: '#fff',
                fontSize: '14.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> : <>Let's Go <Rocket size={16} /></>}
            </button>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
