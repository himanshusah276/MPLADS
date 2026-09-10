import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  X, 
  MapPin, 
  Building2, 
  User, 
  AlertTriangle, 
  FileText,
  ExternalLink,
  Printer
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const WorkDetailModal: React.FC = () => {
  const { selectedWorkId, setSelectedWorkId, setOpenTriageAlertId } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedWorkId) {
      setData(null);
      return;
    }
    setLoading(true);
    api.getWorkDetail(selectedWorkId).then((res) => {
      setData(res);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedWorkId]);

  if (!selectedWorkId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gov-card border border-gov-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-gov-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gov-card-muted border-b border-gov-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gov-primary font-mono">
                  {selectedWorkId}
                </h2>
                {data?.work && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    data.work.risk_band === 'Critical' ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/40' :
                    data.work.risk_band === 'High' ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/40' :
                    data.work.risk_band === 'Medium' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                  }`}>
                    Risk: {data.work.risk_score}/100 ({data.work.risk_band})
                  </span>
                )}
                {data?.cost_analytics?.is_overrun && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                    +{data.cost_analytics.overrun_pct}% Cost Overrun
                  </span>
                )}
              </div>
              <p className="text-xs text-gov-muted truncate max-w-xl font-medium">
                {data?.work?.description || 'Loading official MPLADS work dossier...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-full text-gov-muted hover:text-gov-primary bg-gov-card hover:bg-gov-card-muted border border-gov-border transition cursor-pointer"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedWorkId(null)}
              className="p-1.5 rounded-full text-gov-muted hover:text-gov-primary bg-gov-card hover:bg-gov-card-muted border border-gov-border transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading || !data ? (
          <div className="p-12 text-center text-gov-muted space-y-3 font-medium">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Fetching verified eSAKSHI work records & ML telemetry...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gov-card-muted p-3.5 rounded-xl border border-gov-border">
                <div className="text-[11px] text-gov-muted flex items-center gap-1.5 font-bold">
                  <User className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Recommending MP</span>
                </div>
                <div className="text-sm font-bold text-gov-primary mt-1">
                  {data.mp?.name || 'N/A'}
                </div>
                <div className="text-xs text-gov-muted font-medium">
                  {data.mp?.constituency} • {data.mp?.house} ({data.mp?.party})
                </div>
              </div>

              <div className="bg-gov-card-muted p-3.5 rounded-xl border border-gov-border">
                <div className="text-[11px] text-gov-muted flex items-center gap-1.5 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Implementing Agency</span>
                </div>
                <div className="text-sm font-bold text-gov-primary mt-1 truncate" title={data.agency?.name}>
                  {data.agency?.name || 'District PWD Cell'}
                </div>
                <div className="text-xs text-gov-muted font-medium">
                  Type: {data.agency?.type || 'Govt Dept'}
                </div>
              </div>

              <div className="bg-gov-card-muted p-3.5 rounded-xl border border-gov-border">
                <div className="text-[11px] text-gov-muted flex items-center gap-1.5 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Location & Sanction</span>
                </div>
                <div className="text-sm font-bold text-gov-primary mt-1">
                  {data.work.district}, {data.work.state}
                </div>
                <div className="text-xs text-gov-muted font-mono font-medium">
                  GPS: {data.work.lat.toFixed(4)}, {data.work.long.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Cost Analytics & Overrun Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border">
                <h3 className="text-xs font-bold text-gov-primary uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Expenditure Comparison</span>
                  <span className="font-mono text-gov-muted text-[11px]">in ₹ Lakh</span>
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Estimated Cost', amount: Number((data.work.estimated_cost / 100000).toFixed(1)) },
                        { name: 'Sanctioned Amount', amount: Number((data.work.sanctioned_amount / 100000).toFixed(1)) },
                        { name: 'Actual Cost', amount: Number((data.work.actual_cost / 100000).toFixed(1)) }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-gov)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-primary)' }}
                        formatter={(val: any) => [`₹ ${val} Lakh`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        <Cell fill="#0284c7" />
                        <Cell fill="#4f46e5" />
                        <Cell fill={data.cost_analytics.is_overrun ? '#e11d48' : '#16a34a'} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sanction Details Summary */}
              <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gov-primary uppercase tracking-wider mb-3">
                    Statutory Sanction Audit
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gov-border">
                      <span className="text-gov-muted">Sanction Order:</span>
                      <span className="font-mono text-gov-primary font-bold">{data.work.sanction_order_no || 'NASH/MPLAD/2024/098'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gov-border">
                      <span className="text-gov-muted">Category (Annexure-VIII):</span>
                      <span className="text-gov-primary font-semibold">{data.work.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gov-border">
                      <span className="text-gov-muted">Outside Constituency:</span>
                      <span className={`font-semibold ${data.work.is_outside_constituency ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {data.work.is_outside_constituency ? 'Yes (Param 3.12 active)' : 'No (Home Constituency)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gov-muted">Execution Status:</span>
                      <span className="font-bold text-gov-primary bg-gov-card px-2.5 py-0.5 rounded-full border border-gov-border">
                        {data.work.status}
                      </span>
                    </div>
                  </div>
                </div>

                {data.cost_analytics.is_overrun && (
                  <div className="mt-3 bg-red-500/15 border border-red-500/40 p-2.5 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">
                    <span className="font-bold">Audit Alert:</span> Cost overrun of ₹{(data.cost_analytics.overrun_amount/100000).toFixed(2)} Lakh (+{data.cost_analytics.overrun_pct}%) flagged by Isolation Forest detector.
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step Work Timeline */}
            <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border">
              <h3 className="text-xs font-bold text-gov-primary uppercase tracking-wider mb-4">
                eSAKSHI Execution Workflow Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {data.timeline?.map((step: any, idx: number) => (
                  <div key={idx} className="relative bg-gov-card p-2.5 rounded-lg border border-gov-border flex flex-col justify-between">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-gov-card-muted text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center border border-gov-border">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-gov-primary truncate">{step.step}</span>
                    </div>
                    <div className="text-[10px] text-gov-muted font-medium">
                      {step.date || 'Pending'}
                    </div>
                    <div className="mt-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        step.status === 'Completed' || step.status === 'Filed' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40' :
                        step.status === 'In-Progress' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40' :
                        'bg-gov-card-muted text-gov-muted border border-gov-border'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Anomaly Alerts */}
            {data.alerts && data.alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Linked Anomaly Flags ({data.alerts.length})</span>
                </h3>
                <div className="space-y-2">
                  {data.alerts.map((al: any) => (
                    <div
                      key={al.alert_id}
                      className="bg-gov-card-muted border border-red-500/40 p-3.5 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-red-700 dark:text-red-400">
                            {al.alert_type}
                          </span>
                          {al.rule_code && (
                            <span className="text-[10px] font-mono bg-gov-card text-gov-primary px-2 py-0.5 rounded-md border border-gov-border font-bold">
                              Rule {al.rule_code}
                            </span>
                          )}
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/40">
                            {al.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gov-secondary leading-relaxed font-medium">
                          {al.description}
                        </p>
                        {al.explainable_details && (
                          <p className="text-[11px] text-gov-muted italic">
                            Auditor Reference: {al.explainable_details}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedWorkId(null);
                          setOpenTriageAlertId(al.alert_id);
                        }}
                        className="text-xs bg-gov-card hover:bg-gov-card-muted text-gov-primary px-3.5 py-1.5 rounded-lg border border-gov-border transition flex items-center gap-1 shrink-0 font-semibold cursor-pointer shadow-xs"
                      >
                        <span>Triage Action</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gov-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
