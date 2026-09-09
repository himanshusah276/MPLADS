import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PreCheckWorkResponse } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  Play, 
  RotateCcw,
  Building2,
  Info
} from 'lucide-react';

export const PreCheckSimulatorModal: React.FC = () => {
  const { t } = useApp();
  const [mpId, setMpId] = useState<string>('MP-LS-0101');
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Nashik');
  const [category, setCategory] = useState<string>('Roads & Pathways');
  const [description, setDescription] = useState<string>('Construction of rural link road with cement concrete paving');
  const [estimatedCostLakh, setEstimatedCostLakh] = useState<number>(24.5);
  const [agencyType, setAgencyType] = useState<string>('Govt Dept');
  const [isOutside, setIsOutside] = useState<boolean>(false);
  const [result, setResult] = useState<PreCheckWorkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.preCheckWorkRecommendation({
        mp_id: mpId,
        state,
        district,
        category,
        description,
        estimated_cost: estimatedCostLakh * 100000.0,
        is_outside_constituency: isOutside
      });
      setResult(resp);
    } catch (err) {
      console.error(err);
      alert('Error running simulation');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type: 'clean' | 'outside_breach' | 'prohibited_cat' | 'trust_breach') => {
    if (type === 'clean') {
      setCategory('Drinking Water');
      setDescription('Installation of 5000 LPH solar RO drinking water plant with kiosk at Gram Panchayat');
      setEstimatedCostLakh(18.5);
      setIsOutside(false);
      setAgencyType('Govt Dept');
    } else if (type === 'outside_breach') {
      setCategory('Roads & Pathways');
      setDescription('Construction of 3.2 km heavy arterial bypass road connecting outside district industrial zone');
      setEstimatedCostLakh(38.0); // > 25 Lakh
      setIsOutside(true);
      setAgencyType('Govt Dept');
    } else if (type === 'prohibited_cat') {
      setCategory('Commercial Complex');
      setDescription('Construction of commercial shopping complex and private trust guest house');
      setEstimatedCostLakh(45.0);
      setIsOutside(false);
      setAgencyType('Trust');
    } else if (type === 'trust_breach') {
      setCategory('Education');
      setDescription('Expansion of private vocational training center building for private trust');
      setEstimatedCostLakh(55.0); // > 50 Lakh
      setIsOutside(false);
      setAgencyType('Trust');
    }
    setResult(null);
  };

  return (
    <div className="bg-gov-card border border-gov-border rounded-lg p-6 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            MPLADS Pre-Sanction Statutory Compliance Simulator
          </h2>
        </div>
        <p className="text-xs text-gov-textMuted mt-1">
          Instant rule evaluation tool for MPs and District Magistrates to test proposed work recommendations against official 2023 Guidelines before issuance of Administrative Sanctions.
        </p>
      </div>

      {/* Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quick Presets:</span>
        <button
          onClick={() => loadPreset('clean')}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 transition"
        >
          ✓ Compliant Water Work (₹18.5L)
        </button>
        <button
          onClick={() => loadPreset('outside_breach')}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded border border-slate-700 transition"
        >
          ⚠ Outside Constituency &gt; ₹25L (Rule R3)
        </button>
        <button
          onClick={() => loadPreset('prohibited_cat')}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-red-400 rounded border border-slate-700 transition"
        >
          ✕ Prohibited Commercial Asset (Rule R4)
        </button>
        <button
          onClick={() => loadPreset('trust_breach')}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-red-400 rounded border border-slate-700 transition"
        >
          ✕ Trust Ceiling &gt; ₹50L (Rule R2)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form onSubmit={handleSimulate} className="lg:col-span-7 space-y-4 bg-slate-900/90 p-5 rounded-lg border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Recommending MP</label>
              <select
                value={mpId}
                onChange={(e) => setMpId(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
              >
                <option value="MP-LS-0101">Rajesh Sharma (Nashik - LS)</option>
                <option value="MP-LS-0102">Priya Deshmukh (Pune - LS)</option>
                <option value="MP-LS-0201">Anand Verma (Varanasi - LS)</option>
                <option value="MP-LS-0701">K. Reddy (Warangal - LS)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Work Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
              >
                <option value="Drinking Water">Drinking Water</option>
                <option value="Sanitation">Sanitation / Swachh Bharat</option>
                <option value="Roads & Pathways">Roads & Pathways</option>
                <option value="Education">Education Infrastructure</option>
                <option value="Public Health">Public Health & Hospitals</option>
                <option value="Community Infrastructure">Community Infrastructure</option>
                <option value="Commercial Complex">Commercial / Non-Durable (Prohibited)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Detailed Scope of Work Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Estimated Cost (in ₹ Lakh)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="500"
                value={estimatedCostLakh}
                onChange={(e) => setEstimatedCostLakh(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Proposed Implementing Agency</label>
              <select
                value={agencyType}
                onChange={(e) => setAgencyType(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-xs text-white p-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
              >
                <option value="Govt Dept">State Govt Department (PWD/RD)</option>
                <option value="PSU">State PSU / Jal Nigam Board</option>
                <option value="Local Body">Municipal Corporation / ZP</option>
                <option value="Trust">Registered Charitable Trust</option>
                <option value="Society">Cooperative Society</option>
              </select>
            </div>
          </div>

          {/* Outside Constituency Switch */}
          <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded border border-slate-800">
            <input
              type="checkbox"
              id="outside-check"
              checked={isOutside}
              onChange={(e) => setIsOutside(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded border-slate-700 focus:ring-orange-500"
            />
            <label htmlFor="outside-check" className="text-xs text-slate-300 cursor-pointer">
              Work recommended outside MP's home constituency / state (Subject to Para 3.12 max ₹25 Lakh limit)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Evaluating Rules...' : 'Run Statutory Compliance Pre-Check'}</span>
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-5 flex flex-col">
          {result ? (
            <div className={`p-5 rounded-lg border flex-1 space-y-4 ${
              result.is_compliant 
                ? 'bg-emerald-950/40 border-emerald-800/80' 
                : 'bg-red-950/40 border-red-800/80'
            }`}>
              {/* Verdict Header */}
              <div className="flex items-center space-x-3">
                {result.is_compliant ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center border border-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center border border-red-700">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className={`text-sm font-bold ${result.is_compliant ? 'text-emerald-300' : 'text-red-300'}`}>
                    {result.is_compliant ? 'COMPLIANT & ELIGIBLE' : 'STATUTORY VIOLATION FLAGGED'}
                  </h3>
                  <div className="text-xs text-slate-300 font-mono">
                    Predicted Risk Score: {result.risk_score}/100 ({result.risk_band})
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Recommendation:</div>
                <div className="font-semibold text-slate-100 mt-0.5">{result.recommendation}</div>
              </div>

              {/* Violations List */}
              {result.violations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    Blocking Violations ({result.violations.length}):
                  </div>
                  {result.violations.map((v, i) => (
                    <div key={i} className="p-3 bg-slate-900/90 rounded border border-red-900/60 text-xs space-y-1">
                      <div className="flex justify-between items-center text-red-300 font-bold">
                        <span>{v.rule_name}</span>
                        <span className="text-[10px] font-mono bg-red-950 px-1.5 py-0.5 rounded border border-red-800">{v.rule_code}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{v.explanation}</p>
                      <p className="text-[10px] text-amber-400/90 italic font-mono pt-1">Ref: {v.guideline_reference}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings List */}
              {result.warnings.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Warnings:</div>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="p-2 bg-amber-950/30 border border-amber-900/50 rounded text-[11px] text-amber-200">
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-lg flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">No Simulation Run Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Select a preset or enter work details on the left, then click "Run Statutory Compliance Pre-Check".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
