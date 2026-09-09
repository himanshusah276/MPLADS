import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Globe, UserCheck, BookOpen, Layers, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { role, setRole, lang, setLang, t, setShowExplainer } = useApp();

  const roleOptions: { id: UserRole; title: string; subtitle: string }[] = [
    { id: 'ministry', title: 'Central Nodal Agency (MoSPI)', subtitle: 'Ministry Level (All India)' },
    { id: 'auditor', title: 'CAG Principal Director of Audit', subtitle: 'Statutory Vigilance & Triage' },
    { id: 'state_nodal', title: 'State Nodal Authority (SNA)', subtitle: 'Maharashtra State Cell' },
    { id: 'district_authority', title: 'District Magistrate / Nodal DA', subtitle: 'Nashik Implementing DA' },
    { id: 'mp', title: "Hon'ble MP Rajesh Sharma", subtitle: 'Lok Sabha (Nashik Constituency)' },
  ];

  return (
    <header className="bg-[#0b1329] border-b border-gov-border sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-md">
      {/* Brand & Portal Info */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-emerald-700 flex items-center justify-center shadow-md border border-amber-400/30">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              eSAKSHI <span className="text-xs bg-orange-600/30 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded font-mono font-medium">MPLADS AI v2.0</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block"></span>
              Live ML Engine
            </span>
          </div>
          <p className="text-xs text-gov-textMuted font-medium">
            {t('sub_title')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Risk Methodology Explainer Button */}
        <button
          onClick={() => setShowExplainer(true)}
          className="flex items-center space-x-1.5 text-xs bg-gov-card hover:bg-gov-cardHover text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-gov-border transition shadow-sm"
          title="Explainable AI & Statutory Guideline Rules Breakdown"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">Risk Methodology</span>
        </button>

        {/* Bilingual Switcher */}
        <div className="flex items-center bg-gov-card rounded-md border border-gov-border p-0.5">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition ${
              lang === 'en' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition ${
              lang === 'hi' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Multi-role Selector */}
        <div className="flex items-center bg-gov-card border border-gov-border rounded-md px-3 py-1.5 space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <div className="text-[10px] text-gov-textMuted uppercase tracking-wider font-semibold">Active Portal Role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-2"
            >
              {roleOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200 py-1">
                  {opt.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
