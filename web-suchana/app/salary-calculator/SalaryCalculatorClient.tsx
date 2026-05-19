"use client";

import React, { useState, useMemo } from 'react';
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
  { id: 'rrb_alp', name: 'RRB ALP - Asst. Loco Pilot (Level 2)', basicPay: 19900, hraType: 'Y', taAmount: 1350, daPercent: 50, otherAllowances: 2000, otherDeductions: 500 },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

      {/* Profile Selector Input */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(124,58,237,0.06)', color: 'var(--accent)' }}>
            <Calculator size={18} />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Select Government Job Profile</h2>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--ink)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <Building2 size={16} className="text-purple-500" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedProfile?.name}
              </span>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }} />
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
                marginTop: '6px',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                zIndex: 10,
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                {JOB_PROFILES.map(p => {
                  const isSelected = p.id === selectedProfileId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProfileId(p.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'rgba(124,58,237,0.06)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: '0.1s'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                        <span style={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--accent)' : 'var(--ink)', fontSize: '13.5px' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Basic: ₹{p.basicPay.toLocaleString('en-IN')} | HRA City: {p.hraType} Class
                        </span>
                      </div>
                      {isSelected && <Check size={16} className="text-accent" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'rgba(124,58,237,0.04)', borderRadius: '4px' }}>
          <Info size={15} className="text-purple-500" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Calculations are based on the official 7th Pay Commission Matrix. Assumes current DA at {daPercent}% and standard City HRA (Tier {hraType}).
          </p>
        </div>
      </div>

      {/* Results grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Estimated In-Hand Salary display banner */}
        <div style={{ background: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '24px', color: '#fff', gridColumn: '1 / -1', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
              Estimated In-Hand Salary
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--hd)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <IndianRupee size={28} /> {calculations.inHandSalary.toLocaleString('en-IN')}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', fontWeight: 700, opacity: 0.9 }}>
              <div>Gross: ₹{calculations.grossSalary.toLocaleString('en-IN')}</div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div>Deductions: ₹{calculations.totalDeductions.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Salary Breakdown table */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieChart size={16} className="text-purple-500" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Salary Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Basic Pay</span>
              <span style={{ fontWeight: 800, color: 'var(--ink)' }}>₹{basicPay.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Dearness Allowance ({daPercent}%)</span>
              <span style={{ fontWeight: 800, color: 'var(--ink)' }}>₹{calculations.daAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>HRA ({hraPercent}%)</span>
              <span style={{ fontWeight: 800, color: 'var(--ink)' }}>₹{calculations.hraAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Transport Allowance (TA+DA)</span>
              <span style={{ fontWeight: 800, color: 'var(--ink)' }}>₹{(taAmount + calculations.taDaAmount).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>NPS Deduction (10%)</span>
              <span style={{ fontWeight: 800, color: '#ef4444' }}>- ₹{calculations.npsDeduction.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 5-Year Growth Table */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <TrendingUp size={16} className="text-purple-500" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>5-Year Growth Projection</h3>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            Assumes standard 3% annual increment and estimated DA hikes.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '6px 0', color: 'var(--text-muted)', fontWeight: 700 }}>Year</th>
                  <th style={{ padding: '6px 0', color: 'var(--text-muted)', fontWeight: 700 }}>Basic Pay</th>
                  <th style={{ padding: '6px 0', color: 'var(--text-muted)', fontWeight: 700 }}>Est. DA</th>
                  <th style={{ padding: '6px 0', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>In-Hand</th>
                </tr>
              </thead>
              <tbody>
                {calculations.projection.map((row) => (
                  <tr key={row.year} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '8px 0', fontWeight: 800, color: 'var(--ink)' }}>{row.year}</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>₹{row.basic.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{row.da}%</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: 'var(--accent)' }}>
                      ₹{row.inHand.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
