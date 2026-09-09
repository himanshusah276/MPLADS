from typing import List, Dict, Any
from collections import defaultdict

class AgencyConcentrationAnalyzer:
    """
    Computes Herfindahl-Hirschman Index (HHI) and flags disproportionate single-agency concentration.
    """

    @staticmethod
    def analyze_mp_agency_concentration(
        mps_data: List[Dict[str, Any]],
        works_data: List[Dict[str, Any]],
        agencies_map: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        # Group works by MP
        mp_works = defaultdict(list)
        for w in works_data:
            mp_id = w.get("mp_id")
            if mp_id:
                mp_works[mp_id].append(w)

        alerts = []

        for mp in mps_data:
            mp_id = mp["mp_id"]
            works = mp_works.get(mp_id, [])
            if not works:
                continue

            total_sanctioned = sum(float(w.get("sanctioned_amount", 0.0)) for w in works)
            if total_sanctioned <= 0:
                continue

            # Group spend by agency
            agency_spend = defaultdict(float)
            agency_work_count = defaultdict(int)

            for w in works:
                agency_id = w.get("implementing_agency_id")
                if agency_id:
                    amt = float(w.get("sanctioned_amount", 0.0))
                    agency_spend[agency_id] += amt
                    agency_work_count[agency_id] += 1

            if not agency_spend:
                continue

            # Compute HHI = sum((pct_share)^2)
            hhi = 0.0
            max_share = 0.0
            dominant_agency_id = None

            for ag_id, spend in agency_spend.items():
                share_pct = (spend / total_sanctioned) * 100.0
                hhi += (share_pct ** 2)
                if share_pct > max_share:
                    max_share = share_pct
                    dominant_agency_id = ag_id

            # If dominant agency has > 45% of total MP fund or HHI > 3500
            if max_share >= 45.0 and len(works) >= 4 and dominant_agency_id:
                dom_agency = agencies_map.get(dominant_agency_id, {})
                dom_agency_name = dom_agency.get("name", dominant_agency_id)
                dom_agency_type = dom_agency.get("type", "Agency")
                
                risk_score = min(95.0, 50.0 + (max_share - 45.0) * 1.0 + (hhi / 10000.0 * 20.0))
                severity = "Critical" if max_share >= 70.0 else ("High" if max_share >= 50.0 else "Medium")

                explanation = (
                    f"Agency Concentration Risk (HHI: {hhi:.0f}/10,000): "
                    f"A single implementing agency '{dom_agency_name}' ({dom_agency_type}) has been allocated "
                    f"{max_share:.1f}% (₹{agency_spend[dominant_agency_id]/100000:.2f} Lakh) of all sanctioned works "
                    f"under MP {mp.get('name', mp_id)} across {agency_work_count[dominant_agency_id]} works, "
                    f"indicating lack of competitive agency allotment."
                )

                alerts.append({
                    "mp_id": mp_id,
                    "agency_id": dominant_agency_id,
                    "agency_name": dom_agency_name,
                    "hhi_score": hhi,
                    "dominant_share_pct": max_share,
                    "risk_score": risk_score,
                    "severity": severity,
                    "explanation": explanation
                })

        return alerts
