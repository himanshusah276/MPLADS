import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardKPIs } from '../types';
import { FileText, Briefcase, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const KPICards: React.FC = () => {
  const { selectedState, financialYear, isAnalyzing, t } = useApp();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    api.getKPIs(selectedState, financialYear).then((data) => {
      setKpis(data);
    }).catch(console.error);
  }, [selectedState, financialYear, isAnalyzing]);

  if (!kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gov-card border border-gov-border rounded-lg p-5 animate-pulse h-28"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Sanctioned Card */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-600 transition">
        <div className="flex items-center justify-between text-gov-textMuted text-xs font-semibold uppercase tracking-wider">
          <span>{t('sanctioned')}</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white tracking-tight">
            ₹ {kpis.total_sanctioned_cr.toLocaleString()} <span className="text-sm font-normal text-slate-400">cr</span>
          </div>
          <div className="text-xs text-gov-textMuted mt-0.5">
            across {kpis.total_works.toLocaleString()} works
          </div>
        </div>
      </div>

      {/* 2. Utilized Card */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-600 transition">
        <div className="flex items-center justify-between text-gov-textMuted text-xs font-semibold uppercase tracking-wider">
          <span>{t('utilized')}</span>
          <Briefcase className="w-4 h-4 text-slate-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white tracking-tight">
            ₹ {kpis.total_utilized_cr.toLocaleString()} <span className="text-sm font-normal text-slate-400">cr</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.utilization_rate_pct}% {t('of_sanctioned')}</span>
          </div>
        </div>
      </div>

      {/* 3. UC Overdue Card */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-600 transition">
        <div className="flex items-center justify-between text-gov-textMuted text-xs font-semibold uppercase tracking-wider">
          <span>{t('uc_overdue')}</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white tracking-tight">
            {kpis.uc_overdue_count}
          </div>
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ {kpis.uc_overdue_growth_pct}% {t('vs_last_month')}</span>
          </div>
        </div>
      </div>

      {/* 4. Open Alerts Card */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:border-slate-600 transition">
        <div className="flex items-center justify-between text-gov-textMuted text-xs font-semibold uppercase tracking-wider">
          <span>{t('open_alerts')}</span>
          <AlertTriangle className="w-4 h-4 text-orange-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white tracking-tight">
            {kpis.open_alerts_count}
          </div>
          <div className="text-xs text-red-400 font-semibold mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{kpis.critical_alerts_count} {t('critical')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
