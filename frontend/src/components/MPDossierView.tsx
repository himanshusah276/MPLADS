import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MP, Work } from '../types';
import { 
  Users, 
  Search, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  FileText,
  Eye,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const MPDossierView: React.FC = () => {
  const { selectedState, selectedMPId, setSelectedMPId, setSelectedWorkId, t } = useApp();
  const [mps, setMps] = useState<MP[]>([]);
  const [dossierData, setDossierData] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getMPs({ state: selectedState, search }).then((data) => {
      setMps(data);
      if (!selectedMPId && data.length > 0) {
        setSelectedMPId(data[0].mp_id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedState, search]);

  useEffect(() => {
    if (!selectedMPId) return;
    api.getMPDossier(selectedMPId).then((res) => {
      setDossierData(res);
    }).catch(console.error);
  }, [selectedMPId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left MP List */}
      <div className="lg:col-span-4 space-y-3">
        <div className="bg-gov-card border border-gov-border rounded-lg p-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search MP by name or constituency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white pl-9 pr-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
          {mps.map((mp) => {
            const isSelected = selectedMPId === mp.mp_id;
            return (
              <div
                key={mp.mp_id}
                onClick={() => setSelectedMPId(mp.mp_id)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/95 border-orange-500 shadow-md ring-1 ring-orange-500/30'
                    : 'bg-gov-card border-gov-border hover:bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <span>{mp.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({mp.house})</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    mp.composite_risk_score >= 75 ? 'bg-red-950 text-red-400 border border-red-800' :
                    mp.composite_risk_score >= 50 ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {Math.round(mp.composite_risk_score)}
                  </span>
                </div>

                <div className="text-[11px] text-gov-textMuted mt-1 flex justify-between">
                  <span>{mp.constituency} ({mp.state})</span>
                  <span>{mp.party}</span>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                  <span>Utilized: ₹{(mp.total_utilized / 10000000).toFixed(2)} Cr</span>
                  <span>{mp.works_count || 0} works</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right MP Dossier View */}
      <div className="lg:col-span-8 space-y-4">
        {dossierData ? (
          <>
            {/* MP Header Card */}
            <div className="bg-gov-card border border-gov-border rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-orange-500/40 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {dossierData.mp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">
                        {dossierData.mp.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {dossierData.mp.house} • {dossierData.mp.party}
                      </span>
                    </div>
                    <div className="text-xs text-gov-textMuted mt-0.5">
                      Constituency: <strong className="text-slate-300">{dossierData.mp.constituency}</strong>, {dossierData.mp.state} • Term: 2024–2029
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gov-textMuted">Composite Risk Score</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {dossierData.mp.composite_risk_score} <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Entitlement & 80% UC Milestone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Annual Entitlement</div>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    ₹ 5.00 <span className="text-xs font-normal text-slate-400">Crore</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">₹2.5 Cr × 2 Installments</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Sanctioned & Utilized</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    ₹ {(dossierData.mp.total_utilized / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {dossierData.entitlement_summary?.utilization_rate_pct}% of total sanctioned
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">80% UC Release Eligibility</div>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                    {dossierData.entitlement_summary?.is_eligible_for_inst2_release ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Eligible for Inst 2</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400">Pending UC &ge; 80%</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Statutory requirement Para 4.3</div>
                </div>
              </div>
            </div>

            {/* MP Recommended Works List */}
            <div className="bg-gov-card border border-gov-border rounded-lg p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Sanctioned Works ({dossierData.works?.length || 0})</span>
                <span className="text-slate-400 font-normal">eSAKSHI Verified Database</span>
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dossierData.works?.map((w: Work) => (
                  <div
                    key={w.work_id}
                    onClick={() => setSelectedWorkId(w.work_id)}
                    className="p-3 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center justify-between gap-3 transition cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-100 text-xs">{w.work_id}</span>
                        <span className="text-xs text-orange-400 font-medium">{w.category}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          w.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate max-w-md">
                        {w.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-slate-100">
                        ₹{(w.sanctioned_amount / 100000).toFixed(2)} L
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Risk: {w.risk_score}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gov-card p-12 text-center text-slate-500 rounded-lg">
            Select an MP from the left panel to inspect full entitlement dossier.
          </div>
        )}
      </div>
    </div>
  );
};
