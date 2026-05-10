"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, IndianRupee, PieChart, Info, ChevronDown, Check, Building2 } from 'lucide-react';

const JOB_PROFILES = [
  // UPSC
  { id: 'upsc_ias', name: 'UPSC IAS/IPS/IFS (Level 10)', basicPay: 56100, hraType: 'X', taAmount: 7200, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },

  // SSC
  { id: 'ssc_cgl_aso', name: 'SSC CGL - Inspector/ASO (Level 7)', basicPay: 44900, hraType: 'X', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'ssc_cgl_auditor', name: 'SSC CGL - Auditor/Accountant (Level 5)', basicPay: 29200, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'ssc_cgl_tax', name: 'SSC CGL - Tax Assistant (Level 4)', basicPay: 25500, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'ssc_chsl', name: 'SSC CHSL - LDC/JSA (Level 2)', basicPay: 19900, hraType: 'Y', taAmount: 1350, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'ssc_mts', name: 'SSC MTS - Peon/Jamadar (Level 1)', basicPay: 18000, hraType: 'Z', taAmount: 1350, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },

  // RRB / Railway
  { id: 'rrb_station_master', name: 'RRB NTPC - Station Master (Level 6)', basicPay: 35400, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'rrb_commercial_clerk', name: 'RRB NTPC - Commercial Clerk (Level 3)', basicPay: 21700, hraType: 'Y', taAmount: 1350, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'rrb_alp', name: 'RRB ALP - Asst. Loco Pilot (Level 2)', basicPay: 19900, hraType: 'Y', taAmount: 1350, daPercent: 50, otherAllowances: 2000, otherDeductions: 500 }, // Approx running allowance
  { id: 'rrb_group_d', name: 'RRB Group D (Level 1)', basicPay: 18000, hraType: 'Z', taAmount: 1350, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },

  // State PSC & Police
  { id: 'state_psc_class1', name: 'State PSC - Dy. Collector/DSP (Class I)', basicPay: 56100, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'state_psc_class2', name: 'State PSC - Tehsildar/BDO (Class II)', basicPay: 47600, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'state_si', name: 'State Police Sub-Inspector (SI)', basicPay: 35400, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'police_constable', name: 'State Police Constable', basicPay: 21700, hraType: 'Z', taAmount: 1350, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },

  // Teaching
  { id: 'teacher_pgt', name: 'KVS/NVS PGT Teacher (Level 8)', basicPay: 47600, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'teacher_tgt', name: 'KVS/NVS TGT Teacher (Level 7)', basicPay: 44900, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },
  { id: 'teacher_prt', name: 'KVS/NVS PRT Teacher (Level 6)', basicPay: 35400, hraType: 'Y', taAmount: 3600, daPercent: 50, otherAllowances: 0, otherDeductions: 500 },

  // Defence
  { id: 'defence_nda', name: 'NDA/CDS Lieutenant (Level 10 + MSP)', basicPay: 56100, hraType: 'X', taAmount: 7200, daPercent: 50, otherAllowances: 15500, otherDeductions: 1000 },
];

export default function SalaryCalculatorClient() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('state_psc_class1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedProfile = useMemo(() => {
    return JOB_PROFILES.find(p => p.id === selectedProfileId) || JOB_PROFILES[0];
  }, [selectedProfileId]);

  const { basicPay, hraType, taAmount, daPercent, otherAllowances, otherDeductions } = selectedProfile;

  const hraPercent = hraType === 'X' ? 30 : hraType === 'Y' ? 20 : 10;

  const calculations = useMemo(() => {
    const daAmount = Math.round(basicPay * (daPercent / 100));
    const hraAmount = Math.round(basicPay * (hraPercent / 100));
    const taDaAmount = Math.round(taAmount * (daPercent / 100));

    const grossSalary = basicPay + daAmount + hraAmount + taAmount + taDaAmount + otherAllowances;

    const npsDeduction = Math.round((basicPay + daAmount) * 0.10);
    const totalDeductions = npsDeduction + otherDeductions;

    const inHandSalary = grossSalary - totalDeductions;

    const projection = Array.from({ length: 5 }).map((_, i) => {
      const year = new Date().getFullYear() + i;
      const projectedBasic = Math.round(basicPay * Math.pow(1.03, i));
      const projectedDaPercent = daPercent + (i * 4);
      const projectedDa = Math.round(projectedBasic * (projectedDaPercent / 100));
      const projectedHra = Math.round(projectedBasic * (hraPercent / 100));

      const projectedGross = projectedBasic + projectedDa + projectedHra + taAmount + Math.round(taAmount * (projectedDaPercent / 100)) + otherAllowances;
      const projectedNps = Math.round((projectedBasic + projectedDa) * 0.10);
      const projectedInHand = projectedGross - (projectedNps + otherDeductions);

      return {
        year,
        basic: projectedBasic,
        da: projectedDaPercent,
        inHand: projectedInHand
      };
    });

    return {
      daAmount,
      hraAmount,
      taDaAmount,
      grossSalary,
      npsDeduction,
      totalDeductions,
      inHandSalary,
      projection
    };
  }, [basicPay, daPercent, hraType, taAmount, otherAllowances, otherDeductions, hraPercent]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Calculator size={20} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Select Government Job</h2>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-card)',
              border: '2px solid rgba(var(--accent-rgb), 0.4)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              color: 'var(--text-primary)',
              boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.08)',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
                <Building2 size={18} className="text-accent" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Profile
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                  {selectedProfile?.name}
                </span>
              </div>
            </div>
            <ChevronDown size={20} className="text-accent" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9 }}
                onClick={() => setIsDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                zIndex: 10,
                maxHeight: '350px',
                overflowY: 'auto',
                padding: '8px'
              }}>
                {JOB_PROFILES.map(p => {
                  const isSelected = p.id === selectedProfileId;
                  return (
                    <button
                      key={p.id}
                      className="dropdown-option"
                      onClick={() => {
                        setSelectedProfileId(p.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: '0.1s'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '12px' }}>
                        <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--accent)' : 'var(--text-primary)', fontSize: '14px' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Basic: ₹{p.basicPay.toLocaleString('en-IN')} | HRA: {p.hraType} Class City
                        </span>
                      </div>
                      {isSelected && <Check size={18} className="text-accent" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '8px' }}>
          <Info size={16} className="text-accent" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Calculations are based on 7th Pay Commission. Assumes current DA at {daPercent}% and standard City HRA (Tier {hraType}).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="calculator-grid">
        {/* Main Result Card */}
        <div className="feature-card" style={{ padding: '0', overflow: 'hidden', background: 'var(--accent)', color: 'white', gridColumn: '1 / -1' }}>
          <div style={{ padding: 'clamp(20px, 4vw, 32px)', position: 'relative' }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)",
                zIndex: 0
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '8px' }}>
                Estimated In-Hand Salary
              </div>
              <div style={{ fontSize: 'clamp(36px, 8vw, 48px)', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={32} /> {calculations.inHandSalary.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: '14px', fontWeight: 500, opacity: 0.9 }}>
                <div>Gross: ₹{calculations.grossSalary.toLocaleString('en-IN')}</div>
                <div>Deductions: ₹{calculations.totalDeductions.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="feature-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PieChart size={18} className="text-accent" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Salary Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Basic Pay</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{basicPay.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Dearness Allowance ({daPercent}%)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{calculations.daAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>HRA ({hraPercent}%)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{calculations.hraAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Transport Allowance (TA+DA)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(taAmount + calculations.taDaAmount).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>NPS Deduction (10%)</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>- ₹{calculations.npsDeduction.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Promotion Growth Card */}
        <div className="feature-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={18} className="text-accent" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>5-Year Growth Projection</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Assumes standard 3% annual increment and estimated DA hikes.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600 }}>Year</th>
                  <th style={{ padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600 }}>Basic Pay</th>
                  <th style={{ padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600 }}>Est. DA</th>
                  <th style={{ padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>In-Hand</th>
                </tr>
              </thead>
              <tbody>
                {calculations.projection.map((row) => (
                  <tr key={row.year} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{row.year}</td>
                    <td style={{ padding: '10px 0' }}>₹{row.basic.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 0' }}>{row.da}%</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{row.inHand.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Utility Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 900px) {
          .calculator-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        .dropdown-option:hover {
          background-color: rgba(var(--accent-rgb), 0.05) !important;
        }
      `}} />
    </div>
  );
}
