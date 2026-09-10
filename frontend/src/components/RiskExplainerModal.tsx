import React from 'react';
import { useApp } from '../context/AppContext';
import { X, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

export const RiskExplainerModal: React.FC = () => {
  const { showExplainer, setShowExplainer } = useApp();

  if (!showExplainer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gov-card border border-gov-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-gov-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gov-card-muted border-b border-gov-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gov-primary">
                How Risk Scoring Works — Explainable Hybrid AI Framework
              </h2>
              <p className="text-xs text-gov-muted font-medium">
                Grounding in MPLADS Statutory Guidelines (2023) & Statistical Machine Learning
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplainer(false)}
            className="p-1.5 rounded-full text-gov-muted hover:text-gov-primary bg-gov-card hover:bg-gov-card-muted border border-gov-border transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gov-secondary">
          <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border leading-relaxed font-medium">
            <p className="text-gov-primary">
              Government audits cannot rely on opaque "black box" algorithms. The eSAKSHI Anomaly Platform uses a <strong>dual-layered explainable architecture</strong>: statutory guidelines are hardcoded as deterministic rules, while statistical machine learning catches emergent procurement deviations and geospatial duplicates.
            </p>
          </div>

          {/* Section 1: Deterministic Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>1. Deterministic Statutory Rule Engine (0 False Positives on Policy)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border space-y-1">
                <div className="font-bold text-gov-primary">Rule R1: 80% UC Pre-Release Rule</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-bold">Para 4.3 Guidelines</div>
                <p className="text-[11px] text-gov-muted font-medium">
                  Blocks Release of 2nd installment (or next year's 1st) if prior certified expenditure is &lt; 80.0% of released amount.
                </p>
              </div>

              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border space-y-1">
                <div className="font-bold text-gov-primary">Rule R2: Trust / Society ₹50L Cap</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-bold">Para 3.14 Guidelines</div>
                <p className="text-[11px] text-gov-muted font-medium">
                  Flags any cumulative sanctions exceeding ₹50.0 Lakh lifetime to any single private Trust or Society.
                </p>
              </div>

              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border space-y-1">
                <div className="font-bold text-gov-primary">Rule R3: Outside Constituency ₹25L Cap</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-bold">Para 3.12 Guidelines</div>
                <p className="text-[11px] text-gov-muted font-medium">
                  Enforces statutory maximum ₹25.0 Lakh cap on works recommended outside an MP's home constituency.
                </p>
              </div>

              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border space-y-1">
                <div className="font-bold text-gov-primary">Rule R4: Annexure-VIII Category NLP</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-bold">Annexure-VIII Mandate</div>
                <p className="text-[11px] text-gov-muted font-medium">
                  NLP classifier detects prohibited commercial, private club, religious or non-durable asset scopes.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: ML & Geospatial Outlier Models */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>2. Statistical Machine Learning & Geospatial Outliers</span>
            </h3>

            <div className="space-y-2">
              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border">
                <span className="font-bold text-gov-primary">Isolation Forest Overrun Outlier Detector: </span>
                <span className="text-gov-secondary font-medium">
                  Fits an ensemble of 100 isolation trees on normalized features (Actual/Estimated cost ratio, absolute cost overrun %, duration). Deviations exceeding the 95th percentile generate auditable z-score flags.
                </span>
              </div>

              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border">
                <span className="font-bold text-gov-primary">TF-IDF + Haversine Duplicate Work Clustering: </span>
                <span className="text-gov-secondary font-medium">
                  Calculates lexical similarity matrix on work descriptions (cos(θ) &gt; 0.65) combined with spatial proximity (&lt; 800 meters) to catch split contracts and duplicate billing.
                </span>
              </div>

              <div className="p-3.5 bg-gov-card rounded-xl border border-gov-border">
                <span className="font-bold text-gov-primary">Herfindahl-Hirschman Agency Concentration Index (HHI): </span>
                <span className="text-gov-secondary font-medium">
                  HHI = Σ(s_i)². Flags disproportionate single-agency allocation (&gt; 45% of an MP's fund) to ensure competitive procurement.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Composite Formula */}
          <div className="bg-gov-card-muted p-4 rounded-xl border border-gov-border space-y-1">
            <div className="font-bold text-gov-primary text-xs">Composite Risk Score Formulation:</div>
            <p className="text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold">
              Risk = min(99, Σ(Statutory Rule Violations × 35) + (IsolationForest Anomaly × 0.4) + (NLP/Spatial Clustering × 0.5))
            </p>
            <p className="text-gov-muted text-[10px] pt-1 font-medium">
              Bands: Low (0–24) • Medium (25–49) • High (50–74) • Critical (75–100)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
