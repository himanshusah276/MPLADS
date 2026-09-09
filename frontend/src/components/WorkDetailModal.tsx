import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  X, 
  MapPin, 
  Building2, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  FileText,
  ExternalLink,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {selectedWorkId}
                </h2>
                {data?.work && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    data.work.risk_band === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                    data.work.risk_band === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    data.work.risk_band === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    Risk: {data.work.risk_score}/100 ({data.work.risk_band})
                  </span>
                )}
                {data?.cost_analytics?.is_overrun && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    +{data.cost_analytics.overrun_pct}% Cost Overrun
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xl">
                {data?.work?.description || 'Loading official MPLADS work dossier...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedWorkId(null)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading || !data ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Fetching verified eSAKSHI work records & ML telemetry...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span>Recommending MP</span>
                </div>
                <div className="text-sm font-bold text-slate-100 mt-1">
                  {data.mp?.name || 'N/A'}
                </div>
                <div className="text-xs text-slate-400">
                  {data.mp?.constituency} • {data.mp?.house} ({data.mp?.party})
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Implementing Agency</span>
                </div>
                <div className="text-sm font-bold text-slate-100 mt-1 truncate" title={data.agency?.name}>
                  {data.agency?.name || 'District PWD Cell'}
                </div>
                <div className="text-xs text-slate-400">
                  Type: {data.agency?.type || 'Govt Dept'}
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>Location & Sanction</span>
                </div>
                <div className="text-sm font-bold text-slate-100 mt-1">
                  {data.work.district}, {data.work.state}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  GPS: {data.work.lat.toFixed(4)}, {data.work.long.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Cost Analytics & Overrun Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Expenditure Comparison</span>
                  <span className="font-mono text-slate-400 text-[11px]">in ₹ Lakh</span>
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
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                        formatter={(val: any) => [`₹ ${val} Lakh`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        <Cell fill="#38bdf8" />
                        <Cell fill="#818cf8" />
                        <Cell fill={data.cost_analytics.is_overrun ? '#f43f5e' : '#10b981'} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sanction Details Summary */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
                    Statutory Sanction Audit
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Sanction Order:</span>
                      <span className="font-mono text-slate-200">{data.work.sanction_order_no || 'NASH/MPLAD/2024/098'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Category (Annexure-VIII):</span>
                      <span className="text-slate-200 font-semibold">{data.work.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Outside Constituency:</span>
                      <span className={`font-semibold ${data.work.is_outside_constituency ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {data.work.is_outside_constituency ? 'Yes (Param 3.12 active)' : 'No (Home Constituency)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Execution Status:</span>
                      <span className="font-bold text-white bg-slate-700 px-2 py-0.5 rounded">
                        {data.work.status}
                      </span>
                    </div>
                  </div>
                </div>

                {data.cost_analytics.is_overrun && (
                  <div className="mt-3 bg-red-950/60 border border-red-800/80 p-2.5 rounded text-xs text-red-200">
                    <span className="font-bold">Audit Alert:</span> Cost overrun of ₹{(data.cost_analytics.overrun_amount/100000).toFixed(2)} Lakh (+{data.cost_analytics.overrun_pct}%) flagged by Isolation Forest detector.
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step Work Timeline */}
            <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                eSAKSHI Execution Workflow Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {data.timeline?.map((step: any, idx: number) => (
                  <div key={idx} className="relative bg-slate-900/80 p-2.5 rounded border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-orange-400 flex items-center justify-center border border-slate-700">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-200 truncate">{step.step}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {step.date || 'Pending'}
                    </div>
                    <div className="mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        step.status === 'Completed' || step.status === 'Filed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        step.status === 'In-Progress' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-slate-800 text-slate-500'
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
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Linked Anomaly Flags ({data.alerts.length})</span>
                </h3>
                <div className="space-y-2">
                  {data.alerts.map((al: any) => (
                    <div
                      key={al.alert_id}
                      className="bg-slate-950/80 border border-red-900/40 p-3.5 rounded-lg flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-red-400">
                            {al.alert_type}
                          </span>
                          {al.rule_code && (
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              Rule {al.rule_code}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-red-950 text-red-300 border border-red-800">
                            {al.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {al.description}
                        </p>
                        {al.explainable_details && (
                          <p className="text-[11px] text-slate-400 italic">
                            Auditor Reference: {al.explainable_details}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedWorkId(null);
                          setOpenTriageAlertId(al.alert_id);
                        }}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition flex items-center gap-1 shrink-0"
                      >
                        <span>Triage Action</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
