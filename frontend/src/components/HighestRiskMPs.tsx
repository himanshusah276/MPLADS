import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Award, ChevronRight, AlertCircle } from 'lucide-react';

export const HighestRiskMPs: React.FC = () => {
  const { selectedState, setSelectedMPId, setActiveTab, t } = useApp();
  const [mps, setMps] = useState<any[]>([]);

  useEffect(() => {
    api.getHighestRiskMPs(selectedState, 5).then((data) => {
      setMps(data);
    }).catch(console.error);
  }, [selectedState]);

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'bg-red-500 text-red-100';
    if (score >= 50) return 'bg-orange-500 text-orange-100';
    if (score >= 25) return 'bg-amber-500 text-amber-100';
    return 'bg-emerald-500 text-emerald-100';
  };

  return (
    <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-400" />
          {t('highest_risk_mps')}
        </h3>
        <button
          onClick={() => setActiveTab('mps')}
          className="text-xs text-orange-400 hover:text-orange-300 font-medium transition"
        >
          {t('view_all')}
        </button>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-around">
        {mps.map((mp) => (
          <div
            key={mp.mp_id}
            onClick={() => {
              setSelectedMPId(mp.mp_id);
              setActiveTab('mps');
            }}
            className="group flex items-center justify-between p-2.5 rounded-md bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:border-orange-500/50 transition">
                {mp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-orange-400 transition flex items-center gap-1.5">
                  <span>{mp.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({mp.house})</span>
                </div>
                <div className="text-[11px] text-gov-textMuted flex items-center gap-2">
                  <span>{mp.constituency}</span>
                  <span>•</span>
                  <span>{mp.party}</span>
                </div>
              </div>
            </div>

            {/* Risk Score Pill & Bar */}
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-6 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`w-full ${getRiskColor(mp.composite_risk_score)}`}
                  style={{ height: `${Math.min(100, mp.composite_risk_score)}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${getRiskColor(mp.composite_risk_score)}`}>
                {Math.round(mp.composite_risk_score)}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
