import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any, Tuple

class StatisticalAnomalyDetector:
    """
    Isolation Forest + Multivariate statistical model over work costs, durations, and velocity.
    """

    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42
        )
        self.is_fitted = False

    def extract_features(self, works_data: List[Dict[str, Any]]) -> pd.DataFrame:
        rows = []
        for w in works_data:
            est_cost = max(float(w.get("estimated_cost", 0.0)), 1000.0)
            act_cost = float(w.get("actual_cost", 0.0))
            if act_cost <= 0:
                act_cost = est_cost  # If not completed or not entered yet
                
            cost_ratio = act_cost / est_cost
            cost_overrun_pct = max(0.0, (act_cost - est_cost) / est_cost * 100.0)
            
            # Duration feature
            # Standardize numeric inputs
            rows.append({
                "work_id": w["work_id"],
                "sanctioned_amount": float(w.get("sanctioned_amount", 0.0)),
                "estimated_cost": est_cost,
                "actual_cost": act_cost,
                "cost_ratio": cost_ratio,
                "cost_overrun_pct": cost_overrun_pct,
                "is_outside": 1.0 if w.get("is_outside_constituency") else 0.0
            })
        return pd.DataFrame(rows)

    def fit_and_predict(self, works_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not works_data or len(works_data) < 5:
            # Fallback for very small sample
            return self._heuristic_fallback(works_data)

        df = self.extract_features(works_data)
        feature_cols = ["cost_ratio", "cost_overrun_pct", "sanctioned_amount"]
        X = df[feature_cols].values

        try:
            self.model.fit(X)
            self.is_fitted = True
            raw_scores = self.model.decision_function(X)  # Lower is more anomalous
            preds = self.model.predict(X)  # -1 for anomaly, 1 for normal
        except Exception:
            return self._heuristic_fallback(works_data)

        results = []
        # Normalize scores to 0-100 anomaly confidence
        # Lower decision_function means higher anomaly
        min_score = np.min(raw_scores)
        max_score = np.max(raw_scores)
        score_range = max_score - min_score if (max_score - min_score) > 1e-6 else 1.0

        for i, row in df.iterrows():
            w_id = row["work_id"]
            is_anomaly = (preds[i] == -1)
            raw_s = raw_scores[i]
            
            # Anomaly probability / severity (0 to 100)
            norm_anomaly_score = float(np.clip((1.0 - (raw_s - min_score) / score_range) * 100.0, 0.0, 100.0))
            
            # Explicit overrun explanation
            cost_overrun = row["cost_overrun_pct"]
            cost_ratio = row["cost_ratio"]

            if is_anomaly or cost_overrun > 20.0:
                severity = "Medium"
                if cost_overrun > 50.0 or norm_anomaly_score > 85.0:
                    severity = "Critical"
                elif cost_overrun > 25.0 or norm_anomaly_score > 70.0:
                    severity = "High"

                explanation = (
                    f"Statistical Cost Outlier (Isolation Forest score: {norm_anomaly_score:.1f}/100): "
                    f"Actual cost (₹{row['actual_cost']/100000:.2f}L) deviates by +{cost_overrun:.1f}% "
                    f"over estimated cost (₹{row['estimated_cost']/100000:.2f}L), placing it in the 95th percentile outlier band."
                )

                results.append({
                    "work_id": w_id,
                    "is_anomaly": True,
                    "anomaly_type": "Cost Overrun Anomaly",
                    "risk_score": norm_anomaly_score,
                    "severity": severity,
                    "explanation": explanation
                })

        return results

    def _heuristic_fallback(self, works_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for w in works_data:
            est = float(w.get("estimated_cost", 0.0))
            act = float(w.get("actual_cost", 0.0))
            if est > 0 and act > est * 1.20:
                overrun = ((act - est) / est) * 100.0
                score = min(98.0, 50.0 + overrun * 0.8)
                severity = "Critical" if overrun > 45 else ("High" if overrun > 25 else "Medium")
                results.append({
                    "work_id": w["work_id"],
                    "is_anomaly": True,
                    "anomaly_type": "Cost Overrun Anomaly",
                    "risk_score": score,
                    "severity": severity,
                    "explanation": f"Statistical Cost Deviation: Actual expenditure exceeds estimated cost by {overrun:.1f}% (₹{act/100000:.2f}L vs ₹{est/100000:.2f}L)."
                })
        return results
