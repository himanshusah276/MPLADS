import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AnomalyAlert, AlertStatus } from '../types';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  FileCheck, 
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gov-card border border-gov-border rounded-2xl w-full max-w-2xl shadow-gov-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gov-card-muted border-b border-gov-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gov-primary font-mono">
                  {alert.alert_id}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  alert.severity === 'Critical' ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/40' :
                  alert.severity === 'High' ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/40' :
                  'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                }`}>
                  {alert.severity} Severity
                </span>
                <span className="text-xs text-gov-muted font-mono font-bold">
                  Risk Score: {alert.risk_score}/100
                </span>
              </div>
              <p className="text-xs text-gov-muted font-medium">
                Statutory Vigilance & Triage Review
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenTriageAlertId(null)}
            className="p-1.5 rounded-full text-gov-muted hover:text-gov-primary bg-gov-card hover:bg-gov-card-muted border border-gov-border transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTriageSubmit} className="p-6 space-y-5">
          {/* Anomaly Description Box */}
          <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {alert.alert_type}
              </span>
              {alert.rule_code && (
                <span className="text-[11px] font-mono bg-gov-card text-gov-primary px-2.5 py-0.5 rounded-md border border-gov-border font-bold">
                  Rule Code: {alert.rule_code}
                </span>
              )}
            </div>
            <p className="text-xs text-gov-primary leading-relaxed font-medium">
              {alert.description}
            </p>
            {alert.explainable_details && (
              <p className="text-[11px] text-gov-muted italic pt-1 border-t border-gov-border">
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
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <span>Open Full Work Dossier ({alert.entity_id})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Status Selection (Rounded buttons) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gov-primary uppercase tracking-wider">
              Triage Status Action
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Open', 'Under Review', 'Resolved', 'False Positive'] as AlertStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                    status === st
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-gov-card text-gov-secondary border-gov-border hover:bg-gov-card-muted hover:text-gov-primary'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer Remark Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center justify-between">
              <span>Auditor / Nodal Officer Official Remark</span>
              <span className="text-[10px] text-gov-muted font-normal">Recorded in permanent audit trail</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Physical site verification conducted by District Vigilance Officer. Deviation recovered via debit from IA installment..."
              className="w-full bg-gov-card text-xs text-gov-primary p-3 rounded-lg border border-gov-border focus:outline-none focus:border-orange-500 transition placeholder:text-gov-muted font-medium shadow-xs"
              required
            />
          </div>

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-lg flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setOpenTriageAlertId(null)}
              className="px-4 py-2 bg-gov-card hover:bg-gov-card-muted text-gov-primary text-xs font-bold rounded-lg border border-gov-border transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
