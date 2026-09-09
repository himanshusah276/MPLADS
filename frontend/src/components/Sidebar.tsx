import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  FileText, 
  Flag, 
  Building2, 
  Users, 
  Download, 
  CheckCircle2, 
  Settings,
  HelpCircle,
  ExternalLink,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, role, setShowExplainer } = useApp();
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(42);

  useEffect(() => {
    api.getKPIs().then(res => {
      if (res && res.open_alerts_count !== undefined) {
        setOpenAlertsCount(res.open_alerts_count);
      }
    }).catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'digigov', label: 'eSAKSHI Public Portal', icon: Globe, highlight: true },
    { id: 'works', label: t('works'), icon: FileText },
    { id: 'alerts', label: t('alerts'), icon: Flag, badge: openAlertsCount, badgeColor: 'bg-red-900/60 text-red-300 border border-red-700/60' },
    { id: 'agencies', label: t('agencies'), icon: Building2 },
    { id: 'mps', label: t('mp_dossiers'), icon: Users },
    { id: 'simulator', label: t('simulator'), icon: CheckCircle2 },
    { id: 'reports', label: t('reports'), icon: Download },
  ];

  return (
    <aside className="w-64 bg-gov-sidebar border-r border-gov-border flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] select-none">
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-800/90 text-white font-semibold border-l-4 border-orange-500 shadow-inner'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">
                  Live
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-gov-border space-y-2">
        <button
          onClick={() => setShowExplainer(true)}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Statutory Guidelines 2023</span>
        </button>

        <div className="px-3.5 py-2 bg-slate-900/60 rounded border border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span>eSAKSHI Server v2.4</span>
            <span className="text-[10px] text-emerald-400">● 99.9% Up</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            Nodal Central Engine • MoSPI
          </p>
        </div>
      </div>
    </aside>
  );
};
