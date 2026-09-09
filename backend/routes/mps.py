from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import MP, Work, UtilizationCertificate, AnomalyAlert, ImplementingAgency
from backend.schemas import MPResponse, PreCheckWorkRequest, PreCheckWorkResponse, PreCheckViolation
from backend.auth import get_current_user
from backend.ml.rule_engine import MPLADSRuleEngine

router = APIRouter(prefix="/mps", tags=["Members of Parliament"])

@router.get("", response_model=List[MPResponse])
def list_mps(
    state: Optional[str] = None,
    house: Optional[str] = None,
    risk_band: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MP)
    if state and state != "All":
        query = query.filter(MP.state == state)
    if house and house != "All":
        query = query.filter(MP.house == house)
    if risk_band and risk_band != "All":
        query = query.filter(MP.risk_band == risk_band)
    if search:
        s = f"%{search}%"
        query = query.filter((MP.name.ilike(s)) | (MP.constituency.ilike(s)) | (MP.mp_id.ilike(s)))

    mps = query.order_by(MP.composite_risk_score.desc()).all()
    results = []

    for m in mps:
        works_count = db.query(Work).filter(Work.mp_id == m.mp_id).count()
        open_alerts = db.query(AnomalyAlert).filter(
            AnomalyAlert.entity_id == m.mp_id, AnomalyAlert.status == "Open"
        ).count()
        
        util_pct = (m.total_utilized / m.total_sanctioned * 100.0) if m.total_sanctioned > 0 else 0.0

        resp = MPResponse.model_validate(m)
        resp.works_count = works_count
        resp.open_alerts_count = open_alerts
        resp.utilization_percentage = round(util_pct, 1)
        results.append(resp)

    return results

@router.get("/{mp_id}")
def get_mp_dossier(mp_id: str, db: Session = Depends(get_db)):
    mp = db.query(MP).filter(MP.mp_id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="MP record not found")

    works = db.query(Work).filter(Work.mp_id == mp_id).order_by(Work.recommended_date.desc()).all()
    ucs = db.query(UtilizationCertificate).filter(UtilizationCertificate.mp_id == mp_id).all()
    
    # MP-specific alerts (either directly or on their works)
    work_ids = [w.work_id for w in works]
    alerts = db.query(AnomalyAlert).filter(
        (AnomalyAlert.entity_id == mp_id) | (AnomalyAlert.entity_id.in_(work_ids))
    ).order_by(AnomalyAlert.risk_score.desc()).all()

    # Calculate 80% UC release threshold progress
    # Annual Entitlement = ₹5.0 Cr (Installment 1 = ₹2.5 Cr, Installment 2 = ₹2.5 Cr)
    inst1_threshold_needed = 25000000.0 * 0.80  # ₹2.0 Cr
    certified_amount = sum(u.amount_certified for u in ucs if u.status == "verified")
    is_eligible_for_inst2 = (certified_amount >= inst1_threshold_needed)

    return {
        "mp": mp,
        "works_count": len(works),
        "works": works,
        "ucs": ucs,
        "alerts": alerts,
        "entitlement_summary": {
            "annual_entitlement": mp.annual_entitlement,
            "total_recommended": mp.total_recommended,
            "total_sanctioned": mp.total_sanctioned,
            "total_released": mp.total_released,
            "total_utilized": mp.total_utilized,
            "utilization_rate_pct": round((mp.total_utilized / max(1.0, mp.total_sanctioned)) * 100.0, 1),
            "inst1_certified_amount": certified_amount,
            "inst1_threshold_target": inst1_threshold_needed,
            "is_eligible_for_inst2_release": is_eligible_for_inst2,
            "has_overdue_ucs": any(u.status == "overdue" for u in ucs)
        }
    }

@router.post("/pre-check-recommendation", response_model=PreCheckWorkResponse)
def pre_check_work_recommendation(
    payload: PreCheckWorkRequest,
    db: Session = Depends(get_db)
):
    """
    Real-time MP / District Authority compliance simulator.
    Tests a proposed work against statutory MPLADS Guidelines before sanction.
    """
    rule_engine = MPLADSRuleEngine()
    violations: List[PreCheckViolation] = []
    warnings: List[str] = []
    risk_score = 0.0

    # 1. Check Outside Constituency Limit (₹25 Lakh max)
    has_v, exp = rule_engine.check_outside_constituency_limit(
        payload.is_outside_constituency, payload.estimated_cost
    )
    if has_v:
        violations.append(PreCheckViolation(
            rule_code="R3",
            rule_name="Outside Constituency Ceiling Exceeded",
            severity="High",
            is_blocking=True,
            explanation=exp,
            guideline_reference="MPLADS Guidelines 2023, Para 3.12 (Max ₹25.0 Lakh for outside works)"
        ))
        risk_score += 40.0

    # 2. Check Trust/Society Lifetime Limit (₹50 Lakh max)
    if payload.implementing_agency_id:
        agency = db.query(ImplementingAgency).filter(
            ImplementingAgency.agency_id == payload.implementing_agency_id
        ).first()
        if agency and agency.type in ["Trust", "Society"]:
            # Check existing cumulative sanctions
            existing_sanctions = db.query(Work).filter(
                Work.implementing_agency_id == agency.agency_id
            ).all()
            total_prior = sum(w.sanctioned_amount or 0.0 for w in existing_sanctions)
            has_t_v, t_exp = rule_engine.check_trust_lifetime_limit(
                agency.type, total_prior, payload.estimated_cost
            )
            if has_t_v:
                violations.append(PreCheckViolation(
                    rule_code="R2",
                    rule_name="Trust/Society Lifetime Ceiling Breached",
                    severity="Critical",
                    is_blocking=True,
                    explanation=t_exp,
                    guideline_reference="MPLADS Guidelines 2023, Para 3.14 (Max ₹50.0 Lakh cumulative ceiling)"
                ))
                risk_score += 50.0

    # 3. Check Category Compliance
    has_cat_v, cat_exp = rule_engine.check_permissible_category(payload.category, payload.description)
    if has_cat_v:
        is_crit = "Prohibited" in cat_exp
        violations.append(PreCheckViolation(
            rule_code="R4",
            rule_name="Prohibited / Non-Permissible Category" if is_crit else "Sector Eligibility Warning",
            severity="Critical" if is_crit else "Medium",
            is_blocking=is_crit,
            explanation=cat_exp,
            guideline_reference="MPLADS Guidelines 2023, Annexure-VIII (List of Permissible Durable Community Assets)"
        ))
        risk_score += (45.0 if is_crit else 20.0)

    # 4. Check Entitlement Balance for MP
    mp = db.query(MP).filter(MP.mp_id == payload.mp_id).first()
    if mp:
        remaining_balance = mp.annual_entitlement - mp.total_sanctioned
        if payload.estimated_cost > remaining_balance:
            warnings.append(
                f"Work estimate (₹{payload.estimated_cost/100000:.2f}L) exceeds remaining annual entitlement balance (₹{remaining_balance/100000:.2f}L)."
            )

    is_compliant = len([v for v in violations if v.is_blocking]) == 0
    final_risk = min(99.0, risk_score)
    risk_band = "Low"
    if final_risk >= 75:
        risk_band = "Critical"
    elif final_risk >= 50:
        risk_band = "High"
    elif final_risk >= 25:
        risk_band = "Medium"

    recommendation = "Approved for District Authority Administrative Sanction" if is_compliant else "REJECT / HOLD: Guideline violations must be rectified prior to administrative sanction."

    return PreCheckWorkResponse(
        is_compliant=is_compliant,
        risk_score=final_risk,
        risk_band=risk_band,
        violations=violations,
        warnings=warnings,
        recommendation=recommendation
    )
