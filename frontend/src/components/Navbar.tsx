import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, UserCheck, BookOpen, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { role, setRole, lang, setLang, t, setShowExplainer, theme, toggleTheme } = useApp();

  const roleOptions: { id: UserRole; title: string; subtitle: string }[] = [
    { id: 'ministry', title: 'Central Nodal Agency (MoSPI)', subtitle: 'Ministry Level (All India)' },
    { id: 'auditor', title: 'CAG Principal Director of Audit', subtitle: 'Statutory Vigilance & Triage' },
    { id: 'state_nodal', title: 'State Nodal Authority (SNA)', subtitle: 'Maharashtra State Cell' },
    { id: 'district_authority', title: 'District Magistrate / Nodal DA', subtitle: 'Nashik Implementing DA' },
    { id: 'mp', title: "Hon'ble MP Rajesh Sharma", subtitle: 'Lok Sabha (Nashik Constituency)' },
  ];

  return (
    <header className="bg-gov-header border-b border-gov-border sticky top-0 z-40 select-none shadow-sm transition-colors duration-200">
      {/* Official Government of India Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="px-6 py-2.5 flex items-center justify-between">
        {/* Brand & National Portal Information */}
        <div className="flex items-center space-x-3.5">
          {/* Official Emblem & Portal Badge */}
          <div className="w-9 h-9 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-gov-primary flex items-center gap-2">
                eSAKSHI <span className="text-[11px] bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-md font-mono font-bold">MPLADS AI v2.4</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 inline-block animate-pulse"></span>
                Official Live Engine
              </span>
            </div>
            <p className="text-[11px] text-gov-muted font-medium leading-tight">
              {t('sub_title')}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* ROUNDED THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1.5 text-xs bg-gov-card hover:bg-gov-card-muted text-gov-primary px-3.5 py-1.5 rounded-full border border-gov-border hover:border-slate-400 dark:hover:border-slate-500 transition shadow-sm font-semibold cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Theme</span>
              </>
            )}
          </button>

          {/* Risk Methodology Explainer Button */}
          <button
            onClick={() => setShowExplainer(true)}
            className="flex items-center space-x-1.5 text-xs bg-gov-card hover:bg-gov-card-muted text-gov-secondary hover:text-gov-primary px-3.5 py-1.5 rounded-full border border-gov-border transition shadow-sm font-medium cursor-pointer"
            title="Explainable AI & Statutory Guideline Rules Breakdown"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Risk Rules</span>
          </button>

          {/* Bilingual Switcher (Pill style) */}
          <div className="flex items-center bg-gov-card border border-gov-border p-0.5 rounded-full shadow-sm">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                lang === 'en' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-gov-muted hover:text-gov-primary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                lang === 'hi' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-gov-muted hover:text-gov-primary'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Multi-role Selector */}
          <div className="flex items-center bg-gov-card border border-gov-border px-3 py-1 rounded-lg space-x-2 shadow-sm">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left">
              <div className="text-[9px] text-gov-muted uppercase tracking-wider font-bold">Active Role</div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-xs text-gov-primary font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-gov-card text-gov-primary py-1">
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
