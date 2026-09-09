import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ImplementingAgency } from '../types';
import { Building2, Search, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';

export const AgenciesView: React.FC = () => {
  const { selectedState, t } = useApp();
  const [agencies, setAgencies] = useState<ImplementingAgency[]>([]);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getAgencies({
      state: selectedState,
      agency_type: typeFilter,
      search
    }).then((data) => {
      setAgencies(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedState, typeFilter, search]);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search implementing agency by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white pl-9 pr-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
        >
          <option value="All">All Agency Types</option>
          <option value="Govt Dept">Govt Department (PWD/RD)</option>
          <option value="PSU">PSU / Jal Nigam</option>
          <option value="Local Body">Municipal Corporation / ZP</option>
          <option value="Trust">Trust (Subject to ₹50L Cap)</option>
          <option value="Society">Society (Subject to ₹50L Cap)</option>
        </select>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full bg-gov-card p-12 text-center text-slate-500 rounded-lg">
            Loading implementing agencies...
          </div>
        ) : agencies.length === 0 ? (
          <div className="col-span-full bg-gov-card p-12 text-center text-slate-500 rounded-lg">
            No matching agencies found.
          </div>
        ) : (
          agencies.map((ag) => {
            const isConcentrationRisk = ag.hhi_concentration_score > 3000;
            const isTrustCapRisk = (ag.type === 'Trust' || ag.type === 'Society') && ag.total_sanctioned_amount > 4500000;
            return (
              <div
                key={ag.agency_id}
                className="bg-gov-card border border-gov-border hover:border-slate-600 rounded-lg p-4 flex flex-col justify-between space-y-3 transition shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">
                        {ag.agency_id}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {ag.name}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      ag.risk_band === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                      ag.risk_band === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {ag.type}
                    </span>
                  </div>

                  <div className="text-xs text-gov-textMuted mt-1">
                    {ag.district}, {ag.state}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Works Handled:</span>
                    <span className="font-mono font-bold text-white">{ag.total_works_handled}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Sanctions:</span>
                    <span className="font-mono font-bold text-white">
                      ₹{(ag.total_sanctioned_amount / 100000).toFixed(2)} Lakh
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Flagged Works:</span>
                    <span className={`font-mono font-bold ${ag.flagged_works_count > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {ag.flagged_works_count}
                    </span>
                  </div>
                </div>

                {isTrustCapRisk && (
                  <div className="bg-red-950/60 border border-red-800 p-2 rounded text-[11px] text-red-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Nearing/Exceeding ₹50 Lakh Trust Statutory Ceiling</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
