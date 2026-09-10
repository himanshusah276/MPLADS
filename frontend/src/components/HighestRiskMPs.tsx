import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Award, ChevronRight } from 'lucide-react';

export const HighestRiskMPs: React.FC = () => {
  const { selectedState, setSelectedMPId, setActiveTab, t } = useApp();
  const [mps, setMps] = useState<any[]>([]);

  useEffect(() => {
    api.getHighestRiskMPs(selectedState, 5).then((data) => {
      setMps(data);
    }).catch(console.error);
  }, [selectedState]);

  const getRiskBadge = (score: number) => {
    if (score >= 75) return 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/40';
    if (score >= 50) return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/40';
    if (score >= 25) return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40';
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40';
  };

  return (
    <div className="bg-gov-card border border-gov-border rounded-xl p-4 flex flex-col h-full shadow-gov">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gov-primary flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          {t('highest_risk_mps')}
        </h3>
        <button
          onClick={() => setActiveTab('mps')}
          className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-bold px-2 py-1 rounded-md hover:bg-orange-500/10 transition cursor-pointer"
        >
          {t('view_all')}
        </button>
      </div>

      <div className="space-y-2.5 flex-1 flex flex-col justify-around">
        {mps.map((mp) => (
          <div
            key={mp.mp_id}
            onClick={() => {
              setSelectedMPId(mp.mp_id);
              setActiveTab('mps');
            }}
            className="group flex items-center justify-between p-2.5 rounded-lg bg-gov-card-muted hover:bg-slate-100 dark:hover:bg-slate-800 border border-gov-border transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {/* Rounded Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#0a2540] text-amber-300 border border-slate-600 flex items-center justify-center text-xs font-bold font-mono">
                {mp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-xs font-bold text-gov-primary group-hover:text-orange-600 dark:group-hover:text-orange-400 transition flex items-center gap-1.5">
                  <span>{mp.name}</span>
                  <span className="text-[10px] text-gov-muted font-normal">({mp.house})</span>
                </div>
                <div className="text-[11px] text-gov-muted flex items-center gap-1.5 font-medium">
                  <span>{mp.constituency}</span>
                  <span>•</span>
                  <span>{mp.party}</span>
                </div>
              </div>
            </div>

            {/* Risk Score */}
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${getRiskBadge(mp.composite_risk_score)}`}>
                {Math.round(mp.composite_risk_score)}/100
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gov-muted group-hover:text-gov-primary group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
