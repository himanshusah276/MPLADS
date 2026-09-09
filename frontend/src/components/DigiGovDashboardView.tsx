import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Building2, 
  Search, 
  Download, 
  RotateCcw, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  Camera,
  Layers,
  Award
} from 'lucide-react';

export const DigiGovDashboardView: React.FC = () => {
  const { setSelectedMPId, setSelectedWorkId, setActiveTab, t } = useApp();
  const [tenure, setTenure] = useState<string>('All');
  const [state, setState] = useState<string>('All');
  const [constituency, setConstituency] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  
  const [summary, setSummary] = useState<any>(null);
  const [mpsData, setMpsData] = useState<any[]>([]);
  const [constituencyMap, setConstituencyMap] = useState<Record<string, string[]>>({});
  const [statesList, setStatesList] = useState<string[]>([]);
  const [tenuresList, setTenuresList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/digigov/constituencies')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStatesList(data.states || []);
          setTenuresList(data.tenures || []);
          setConstituencyMap(data.constituency_map || {});
        }
      })
      .catch(console.error);

    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const summaryUrl = `http://localhost:8000/api/digigov/summary?tenure=${tenure}&state=${state}`;
    const mpsUrl = `http://localhost:8000/api/digigov/mps?tenure=${tenure}&state=${state}&constituency=${constituency}&search=${search}`;

    Promise.all([
      fetch(summaryUrl).then(r => r.json()),
      fetch(mpsUrl).then(r => r.json())
    ]).then(([sData, mData]) => {
      setSummary(sData);
      setMpsData(mData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleReset = () => {
    setTenure('All');
    setState('All');
    setConstituency('All');
    setSearch('');
    setTimeout(() => {
      fetch('http://localhost:8000/api/digigov/summary').then(r => r.json()).then(setSummary);
      fetch('http://localhost:8000/api/digigov/mps').then(r => r.json()).then(setMpsData);
    }, 50);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const availableConstituencies = state !== 'All' && constituencyMap[state] 
    ? constituencyMap[state] 
    : Object.values(constituencyMap).flat();

  return (
    <div className="space-y-6">
      {/* Official MoSPI DigiGov Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#13203c] to-slate-900 border border-gov-border rounded-xl p-6 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-orange-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Official Public Portal
              </span>
              <span className="text-xs text-slate-400">
                Source: <a href="https://mplads.mospi.gov.in/digigov/dashboard.html" target="_blank" rel="noreferrer" className="text-orange-400 underline hover:text-orange-300">mplads.mospi.gov.in/digigov/dashboard.html</a>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>MPLADS — eSAKSHI Public Citizen Dashboard</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time fund authorization and developmental works tracking across all Lok Sabha and Rajya Sabha constituencies under the revised eSAKSHI fund-flow framework.
            </p>
          </div>

          <a
            href="http://localhost:8000/api/digigov/export"
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition shadow-sm"
            download
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Official DigiGov Dataset (.CSV)</span>
          </a>
        </div>
      </div>

      {/* Official DigiGov 4-Field Search Form (Tenure, State, Constituency, MP Name, Reset, Search) */}
      <form onSubmit={handleSearchSubmit} className="bg-gov-card border border-gov-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-orange-400" />
          <span>Constituency & MP Inquiry Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Tenure Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tenure</label>
            <select
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500"
            >
              <option value="All">All Tenures (18th LS / 17th LS / RS)</option>
              <option value="18th Lok Sabha (2024-2029)">18th Lok Sabha (2024–2029)</option>
              <option value="17th Lok Sabha (2019-2024)">17th Lok Sabha (2019–2024)</option>
              <option value="Rajya Sabha">Rajya Sabha</option>
            </select>
          </div>

          {/* 2. State Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">State / UT</label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setConstituency('All');
              }}
              className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500"
            >
              <option value="All">All States / UTs</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 3. Constituency Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Constituency</label>
            <select
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500"
            >
              <option value="All">All Constituencies</option>
              {Array.from(new Set(availableConstituencies)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. MP Name Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">MP Name</label>
            <input
              type="text"
              placeholder="Search MP name or party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Buttons strictly matching DigiGov */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition border border-slate-700 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Official DigiGov Summary KPI Tiles */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Allocated Limit */}
          <div className="bg-gov-card border border-gov-border rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Allocated Limit
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              ₹ {summary.total_allocated_limit_cr?.toLocaleString()} <span className="text-sm font-normal text-slate-400">Cr</span>
            </div>
            <div className="text-[10px] text-gov-textMuted mt-1">
              ₹5.00 Cr / MP / Year online authorisations
            </div>
          </div>

          {/* Amount Recommended */}
          <div className="bg-gov-card border border-gov-border rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Amount Recommended
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              ₹ {summary.total_recommended_cr?.toLocaleString()} <span className="text-sm font-normal text-slate-400">Cr</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              across {summary.works_metrics?.total_works_recommended?.toLocaleString()} works submitted by MPs
            </div>
          </div>

          {/* Amount Sanctioned */}
          <div className="bg-gov-card border border-gov-border rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Amount Sanctioned
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              ₹ {summary.total_sanctioned_cr?.toLocaleString()} <span className="text-sm font-normal text-slate-400">Cr</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              {summary.works_metrics?.sanction_rate_pct}% sanction rate by District Authorities
            </div>
          </div>

          {/* Vendor Payments Released */}
          <div className="bg-gov-card border border-gov-border rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Vendor Payments Released
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              ₹ {summary.total_vendor_released_cr?.toLocaleString()} <span className="text-sm font-normal text-slate-400">Cr</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between">
              <span>Completed Works: <strong className="text-white">{summary.works_metrics?.total_works_completed}</strong></span>
              <span>In-Progress: <strong className="text-white">{summary.works_metrics?.total_works_in_progress}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Official DigiGov Results Table */}
      <div className="bg-gov-card border border-gov-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Constituency-Wise Scheme Records ({mpsData.length} MPs Covered)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click any row to inspect work breakdown or AI anomaly flags
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-gov-border">
              <tr>
                <th className="p-3">MP & Constituency</th>
                <th className="p-3">Tenure</th>
                <th className="p-3">Party</th>
                <th className="p-3 text-right">Allocated (₹ Cr)</th>
                <th className="p-3 text-right">Recommended (₹ Cr)</th>
                <th className="p-3 text-right">Sanctioned (₹ Cr)</th>
                <th className="p-3 text-right">Vendor Released (₹ Cr)</th>
                <th className="p-3 text-center">Works (Rec/Sanc/Comp)</th>
                <th className="p-3 text-center">AI Risk Flag</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    Loading official eSAKSHI DigiGov dataset...
                  </td>
                </tr>
              ) : mpsData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No matching constituency records found. Try resetting the filters.
                  </td>
                </tr>
              ) : (
                mpsData.map((m) => (
                  <tr
                    key={m.mp_id}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => {
                      setSelectedMPId(m.mp_id);
                      setActiveTab('mps');
                    }}
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{m.mp_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({m.house})</span>
                      </div>
                      <div className="text-[11px] text-gov-textMuted">
                        {m.constituency}, {m.state}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {m.tenure ? m.tenure.split('(')[0].trim() : '18th Lok Sabha'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-300">
                      {m.party}
                    </td>
                    <td className="p-3 font-mono text-right text-slate-300">
                      ₹{m.allocated_limit_cr.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-right text-slate-200 font-semibold">
                      ₹{m.amount_recommended_cr.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-right text-slate-100 font-semibold">
                      ₹{m.amount_sanctioned_cr.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-right font-bold text-emerald-400">
                      ₹{m.vendor_payments_released_cr.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="text-slate-300">{m.works_recommended}</span> / <span className="text-slate-300">{m.works_sanctioned}</span> / <span className="text-emerald-400 font-bold">{m.works_completed}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.risk_score >= 75 ? 'bg-red-950 text-red-400 border border-red-800' :
                        m.risk_score >= 50 ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                        m.risk_score >= 25 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {m.risk_score}/100
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMPId(m.mp_id);
                          setActiveTab('mps');
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition"
                        title="View MP Entitlement & Works Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
