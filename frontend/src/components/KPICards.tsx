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
          <div key={i} className="bg-gov-card border border-gov-border p-5 animate-pulse h-28"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Sanctioned Card */}
      <div className="bg-gov-card border border-gov-border p-4 flex flex-col justify-between shadow-gov border-t-2 border-t-blue-600 transition">
        <div className="flex items-center justify-between text-gov-muted text-xs font-bold uppercase tracking-wider">
          <span>{t('sanctioned')}</span>
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-gov-primary tracking-tight">
            ₹ {kpis.total_sanctioned_cr.toLocaleString()} <span className="text-sm font-semibold text-gov-muted">cr</span>
          </div>
          <div className="text-xs text-gov-muted mt-0.5 font-medium">
            across {kpis.total_works.toLocaleString()} sanctioned works
          </div>
        </div>
      </div>

      {/* 2. Utilized Card */}
      <div className="bg-gov-card border border-gov-border p-4 flex flex-col justify-between shadow-gov border-t-2 border-t-emerald-600 transition">
        <div className="flex items-center justify-between text-gov-muted text-xs font-bold uppercase tracking-wider">
          <span>{t('utilized')}</span>
          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-gov-primary tracking-tight">
            ₹ {kpis.total_utilized_cr.toLocaleString()} <span className="text-sm font-semibold text-gov-muted">cr</span>
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis.utilization_rate_pct}% {t('of_sanctioned')}</span>
          </div>
        </div>
      </div>

      {/* 3. UC Overdue Card */}
      <div className="bg-gov-card border border-gov-border p-4 flex flex-col justify-between shadow-gov border-t-2 border-t-amber-600 transition">
        <div className="flex items-center justify-between text-gov-muted text-xs font-bold uppercase tracking-wider">
          <span>{t('uc_overdue')}</span>
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-gov-primary tracking-tight">
            {kpis.uc_overdue_count}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>↑ {kpis.uc_overdue_growth_pct}% {t('vs_last_month')}</span>
          </div>
        </div>
      </div>

      {/* 4. Open Alerts Card */}
      <div className="bg-gov-card border border-gov-border p-4 flex flex-col justify-between shadow-gov border-t-2 border-t-red-600 transition">
        <div className="flex items-center justify-between text-gov-muted text-xs font-bold uppercase tracking-wider">
          <span>{t('open_alerts')}</span>
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-gov-primary tracking-tight">
            {kpis.open_alerts_count}
          </div>
          <div className="text-xs text-red-700 dark:text-red-400 font-bold mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
            <span>{kpis.critical_alerts_count} {t('critical')} flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
