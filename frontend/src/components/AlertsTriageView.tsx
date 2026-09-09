import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyAlert, AlertStatus, Severity } from '../types';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Download, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const AlertsTriageView: React.FC = () => {
  const { selectedState, selectedSeverity, setOpenTriageAlertId, setSelectedWorkId, isAnalyzing, t } = useApp();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getAlerts(selectedSeverity, statusFilter, selectedState).then((data) => {
      setAlerts(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedState, selectedSeverity, statusFilter, isAnalyzing]);

  const filteredAlerts = alerts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.alert_id.toLowerCase().includes(s) ||
      a.entity_id.toLowerCase().includes(s) ||
      a.alert_type.toLowerCase().includes(s) ||
      a.description.toLowerCase().includes(s) ||
      (a.entity_name && a.entity_name.toLowerCase().includes(s))
    );
  });

  const exportCSV = () => {
    const rows = [
      ["Alert ID", "Entity Type", "Entity ID", "Alert Type", "Severity", "Risk Score", "Status", "Reviewer Role", "Reviewer Comment", "Detected On", "Description"],
      ...filteredAlerts.map(a => [
        a.alert_id,
        a.entity_type,
        a.entity_id,
        `"${a.alert_type}"`,
        a.severity,
        a.risk_score,
        a.status,
        `"${a.reviewer_role || ''}"`,
        `"${(a.reviewer_comment || '').replace(/"/g, '""')}"`,
        a.detected_on,
        `"${a.description.replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `MPLADS_Vigilance_Triage_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts by ID, rule, MP, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white pl-9 pr-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Tabs */}
          <div className="flex bg-slate-900 rounded p-0.5 border border-slate-700 text-xs">
            {['All', 'Open', 'Under Review', 'Resolved', 'False Positive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded transition ${
                  statusFilter === st
                    ? 'bg-orange-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-gov-card p-12 text-center text-slate-500 rounded-lg">
            Loading anomaly alerts & triage audit log...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-gov-card p-12 text-center text-slate-500 rounded-lg">
            No anomaly alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((a) => (
            <div
              key={a.alert_id}
              className={`bg-gov-card border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-sm hover:border-slate-600 ${
                a.severity === 'Critical' ? 'border-red-900/50 bg-red-950/10' :
                a.severity === 'High' ? 'border-orange-900/50 bg-orange-950/10' :
                'border-gov-border'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-100 text-xs">
                    {a.alert_id}
                  </span>
                  <span className="text-[11px] font-bold text-orange-400">
                    {a.alert_type}
                  </span>
                  {a.rule_code && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      Clause {a.rule_code}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    a.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                    a.severity === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    a.severity === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {a.severity} Severity ({a.risk_score}/100)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    a.status === 'Resolved' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                    a.status === 'Under Review' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                    a.status === 'False Positive' ? 'bg-purple-950 text-purple-400 border-purple-800' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {a.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {a.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gov-textMuted pt-1">
                  <span>Entity: <strong className="text-slate-300 font-mono">{a.entity_id}</strong> ({a.entity_name || a.district || a.state})</span>
                  <span>•</span>
                  <span>Detected: {a.detected_on}</span>
                  {a.reviewer_comment && (
                    <>
                      <span>•</span>
                      <span className="text-amber-300/90 font-medium italic">
                        Remark ({a.reviewer_role}): "{a.reviewer_comment}"
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {a.entity_type === 'work' && (
                  <button
                    onClick={() => setSelectedWorkId(a.entity_id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded border border-slate-700 transition"
                  >
                    Work Dossier
                  </button>
                )}
                <button
                  onClick={() => setOpenTriageAlertId(a.alert_id)}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Triage Decision</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
