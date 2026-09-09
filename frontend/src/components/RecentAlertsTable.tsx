import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyAlert, Severity, AlertStatus } from '../types';
import { 
  Eye, 
  Download, 
  ChevronDown, 
  Filter, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  ArrowUpDown,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const RecentAlertsTable: React.FC = () => {
  const { selectedState, selectedSeverity, setSelectedWorkId, setOpenTriageAlertId, t } = useApp();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    api.getAlerts(selectedSeverity, 'All', selectedState).then((data) => {
      setAlerts(data);
    }).catch(console.error);
  }, [selectedState, selectedSeverity]);

  const toggleSelectAll = () => {
    if (selectedAlertIds.size === alerts.length) {
      setSelectedAlertIds(new Set());
    } else {
      setSelectedAlertIds(new Set(alerts.map((a) => a.alert_id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedAlertIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAlertIds(next);
  };

  const exportCSV = () => {
    const rows = [
      ["Alert ID", "Entity Type", "Entity ID", "Entity / Location", "Alert Type", "Severity", "Risk Score", "Status", "Detected On", "Description"],
      ...alerts.map(a => [
        a.alert_id,
        a.entity_type,
        a.entity_id,
        `"${a.entity_name || ''}"`,
        `"${a.alert_type}"`,
        a.severity,
        a.risk_score,
        a.status,
        a.detected_on,
        `"${a.description.replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPLADS_Anomaly_Alerts_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-950/80 text-red-400 border border-red-800';
      case 'High':
        return 'bg-orange-950/80 text-orange-400 border border-orange-800';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-400 border border-amber-800';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Under Review':
        return 'bg-blue-950/70 text-blue-400 border-blue-800';
      case 'Resolved':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800';
      case 'False Positive':
        return 'bg-purple-950/70 text-purple-400 border-purple-800';
    }
  };

  const displayedAlerts = alerts.slice(0, 10);

  return (
    <div className="bg-gov-card border border-gov-border rounded-lg p-4 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            {t('recent_alerts')}
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {alerts.length} total
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export to CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded border border-slate-700 transition shadow-sm"
            title="Export full alerts log to CSV for audit"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-gov-border">
            <tr>
              <th className="p-3 w-8">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                  {selectedAlertIds.size === alerts.length && alerts.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3">{t('work_id')}</th>
              <th className="p-3">{t('mp')}</th>
              <th className="p-3">{t('district')}</th>
              <th className="p-3">{t('type')}</th>
              <th className="p-3">{t('severity')}</th>
              <th className="p-3">{t('status')}</th>
              <th className="p-3 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayedAlerts.map((a) => {
              const isSelected = selectedAlertIds.has(a.alert_id);
              return (
                <tr
                  key={a.alert_id}
                  className={`hover:bg-slate-800/50 transition ${isSelected ? 'bg-slate-800/30' : ''}`}
                >
                  <td className="p-3">
                    <button onClick={() => toggleSelect(a.alert_id)} className="text-slate-400 hover:text-white">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-200">
                    <button
                      onClick={() => a.entity_type === 'work' ? setSelectedWorkId(a.entity_id) : setOpenTriageAlertId(a.alert_id)}
                      className="hover:text-orange-400 hover:underline"
                    >
                      {a.entity_id}
                    </button>
                  </td>
                  <td className="p-3 font-medium text-slate-300">
                    {a.entity_name ? a.entity_name.split('(')[0].trim() : 'Hon\'ble MP'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {a.district || a.state || 'Nodal'}
                  </td>
                  <td className="p-3 font-medium text-slate-200">
                    <span className="truncate max-w-[200px] block" title={a.alert_type}>
                      {a.alert_type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getSeverityBadge(a.severity)}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {/* View Details / Triage Button */}
                    <button
                      onClick={() => setOpenTriageAlertId(a.alert_id)}
                      className="p-1 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded transition"
                      title="Inspect & Triage Anomaly Alert"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator matching wireframe */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-xs text-gov-textMuted">
        <span>Showing 1–{displayedAlerts.length} of {alerts.length}</span>
        <div className="flex items-center space-x-2">
          <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition disabled:opacity-50" disabled>
            &lt;
          </button>
          <button className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
