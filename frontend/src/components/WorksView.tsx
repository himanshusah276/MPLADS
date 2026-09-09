import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Work, WorkStatus } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const WorksView: React.FC = () => {
  const { selectedState, selectedSeverity, setSelectedWorkId, t } = useApp();
  const [works, setWorks] = useState<Work[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getWorks({
      state: selectedState,
      risk_band: selectedSeverity,
      category: categoryFilter,
      status: statusFilter,
      search
    }).then((data) => {
      setWorks(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedState, selectedSeverity, categoryFilter, statusFilter, search]);

  const categories = [
    "All", "Drinking Water", "Sanitation", "Roads & Pathways", 
    "Education", "Public Health", "Community Infrastructure", 
    "Irrigation & Water Conservation", "Sports & Youth", "Commercial"
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search works by ID, description, sanction order, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 text-xs text-white pl-9 pr-4 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Sectors' : c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Statuses</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Sanctioned">Sanctioned</option>
          </select>
        </div>
      </div>

      {/* Works Table */}
      <div className="bg-gov-card border border-gov-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-gov-border">
              <tr>
                <th className="p-3">Work ID</th>
                <th className="p-3">Sector & Description</th>
                <th className="p-3">Location & MP</th>
                <th className="p-3">Sanction / Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Band</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading works database...
                  </td>
                </tr>
              ) : works.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching works found for the selected filters.
                  </td>
                </tr>
              ) : (
                works.map((w) => {
                  const isOverrun = w.actual_cost > w.estimated_cost * 1.15;
                  return (
                    <tr key={w.work_id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-slate-200">
                        <button
                          onClick={() => setSelectedWorkId(w.work_id)}
                          className="hover:text-orange-400 hover:underline"
                        >
                          {w.work_id}
                        </button>
                        {w.is_outside_constituency && (
                          <span className="block text-[9px] text-amber-400 font-sans">
                            Outside Const.
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-sm">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{w.category}</span>
                          {w.alerts_count && w.alerts_count > 0 ? (
                            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                              {w.alerts_count} Flag{w.alerts_count > 1 ? 's' : ''}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-slate-400 text-[11px] truncate mt-0.5" title={w.description}>
                          {w.description}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{w.district}, {w.state}</div>
                        <div className="text-[11px] text-slate-400">{w.mp_name || w.mp_id}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-100">
                          ₹{(w.sanctioned_amount / 100000).toFixed(2)} L
                        </div>
                        {isOverrun ? (
                          <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Actual: ₹{(w.actual_cost/100000).toFixed(2)}L</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">
                            Est: ₹{(w.estimated_cost/100000).toFixed(2)}L
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          w.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          w.status === 'In-Progress' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.risk_band === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                          w.risk_band === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                          w.risk_band === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {w.risk_score}/100 ({w.risk_band})
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedWorkId(w.work_id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition shadow-sm"
                          title="Open Work Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
