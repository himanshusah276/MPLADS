import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyAlert, AlertStatus } from '../types';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  FileCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const AlertTriageModal: React.FC = () => {
  const { openTriageAlertId, setOpenTriageAlertId, setSelectedWorkId, currentUser } = useApp();
  const [alert, setAlert] = useState<AnomalyAlert | null>(null);
  const [status, setStatus] = useState<AlertStatus>('Under Review');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (!openTriageAlertId) {
      setAlert(null);
      setSuccessMsg('');
      return;
    }
    api.getAlertDetail(openTriageAlertId).then((res) => {
      setAlert(res);
      setStatus(res.status);
      setComment(res.reviewer_comment || '');
    }).catch(console.error);
  }, [openTriageAlertId]);

  if (!openTriageAlertId || !alert) return null;

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      window.alert("Please provide an official audit/review remark before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await api.triageAlert(alert.alert_id, status, comment, currentUser.role_title || 'Auditor');
      setSuccessMsg(`Alert status successfully updated to '${status}'.`);
      setTimeout(() => {
        setOpenTriageAlertId(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      window.alert("Failed to submit triage. Please check backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono">
                  {alert.alert_id}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  alert.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                  alert.severity === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                  'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {alert.severity} Severity
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Risk Score: {alert.risk_score}/100
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory Vigilance & Triage Review
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenTriageAlertId(null)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTriageSubmit} className="p-6 space-y-5">
          {/* Anomaly Description Box */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400">
                {alert.alert_type}
              </span>
              {alert.rule_code && (
                <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Rule Code: {alert.rule_code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {alert.description}
            </p>
            {alert.explainable_details && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                Auditable Explanation: {alert.explainable_details}
              </p>
            )}
            
            {alert.entity_type === 'work' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkId(alert.entity_id);
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Work Dossier ({alert.entity_id})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Triage Status Action
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Open', 'Under Review', 'Resolved', 'False Positive'] as AlertStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition ${
                    status === st
                      ? 'bg-orange-600 text-white border-orange-500 shadow-md ring-2 ring-orange-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer Remark Comment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Auditor / Nodal Officer Official Remark</span>
              <span className="text-[10px] text-slate-500 font-normal">Recorded in permanent audit trail</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Physical site verification conducted by District Vigilance Officer. Deviation recovered via debit from IA installment..."
              className="w-full bg-slate-950 text-xs text-white p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500 transition placeholder:text-slate-600"
              required
            />
          </div>

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setOpenTriageAlertId(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{submitting ? 'Committing...' : 'Commit Triage Decision'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
