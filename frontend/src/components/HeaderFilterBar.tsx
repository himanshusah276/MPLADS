import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCw, Calendar, MapPin, AlertTriangle, ChevronDown } from 'lucide-react';

const STATE_OPTIONS = [
  "All states",
  "Maharashtra",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Karnataka",
  "Odisha",
  "Rajasthan",
  "Telangana",
  "Gujarat",
  "West Bengal",
  "Bihar"
];

const SEVERITY_OPTIONS = [
  "All severities",
  "Critical",
  "High",
  "Medium",
  "Low"
];

const FY_OPTIONS = [
  "Apr 2025 – Mar 2026",
  "Apr 2024 – Mar 2025",
  "Apr 2023 – Mar 2024"
];

export const HeaderFilterBar: React.FC = () => {
  const { 
    financialYear, 
    setFinancialYear, 
    selectedState, 
    setSelectedState, 
    selectedSeverity, 
    setSelectedSeverity, 
    isAnalyzing, 
    runAnalysis, 
    lastSynced, 
    t 
  } = useApp();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gov-border mb-6">
      {/* Filters Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Financial Year Selector */}
        <div className="relative">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="appearance-none bg-[#1e293b] text-slate-200 text-xs font-semibold px-4 py-2 pr-9 rounded-md border border-gov-border hover:border-slate-500 focus:outline-none focus:border-orange-500 transition cursor-pointer shadow-sm"
          >
            {FY_OPTIONS.map((fy) => (
              <option key={fy} value={fy} className="bg-slate-900 text-white">
                {fy}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* State Selector */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="appearance-none bg-[#1e293b] text-slate-200 text-xs font-semibold px-4 py-2 pr-9 rounded-md border border-gov-border hover:border-slate-500 focus:outline-none focus:border-orange-500 transition cursor-pointer shadow-sm"
          >
            {STATE_OPTIONS.map((st) => (
              <option key={st} value={st} className="bg-slate-900 text-white">
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Severity Selector */}
        <div className="relative">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="appearance-none bg-[#1e293b] text-slate-200 text-xs font-semibold px-4 py-2 pr-9 rounded-md border border-gov-border hover:border-slate-500 focus:outline-none focus:border-orange-500 transition cursor-pointer shadow-sm"
          >
            {SEVERITY_OPTIONS.map((sev) => (
              <option key={sev} value={sev} className="bg-slate-900 text-white">
                {sev}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Sync Status & Run Analysis Action */}
      <div className="flex items-center space-x-3">
        <span className="text-xs text-gov-textMuted font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {lastSynced}
        </span>

        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md border border-gov-border hover:border-slate-500 active:scale-95 transition shadow-sm disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-orange-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing ML Pipeline...' : t('run_analysis')}</span>
        </button>
      </div>
    </div>
  );
};
