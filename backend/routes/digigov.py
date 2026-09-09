from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from collections import defaultdict

from backend.database import get_db
from backend.models import MP, Work, ImplementingAgency, FundRelease, UtilizationCertificate, AnomalyAlert
from backend.schemas import MPResponse, WorkResponse

router = APIRouter(prefix="/digigov", tags=["MoSPI eSAKSHI DigiGov Public Dataset"])

@router.get("/summary")
def get_digigov_summary(
    tenure: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns high-level eSAKSHI public dashboard figures matching https://mplads.mospi.gov.in/digigov/dashboard.html
    """
    mps_q = db.query(MP)
    works_q = db.query(Work)

    if tenure and tenure != "All":
        mps_q = mps_q.filter(MP.tenure == tenure)
        works_q = works_q.filter(Work.tenure == tenure)

    if state and state != "All":
        mps_q = mps_q.filter(MP.state == state)
        works_q = works_q.filter(Work.state == state)

    mps = mps_q.all()
    works = works_q.all()

    total_allocated_limit = sum(m.allocated_limit or 250000000.0 for m in mps)
    total_recommended = sum(w.estimated_cost or 0.0 for w in works)
    total_sanctioned = sum(w.sanctioned_amount or 0.0 for w in works)
    total_vendor_released = sum(w.actual_cost or 0.0 for w in works if w.status in ["In-Progress", "Completed"])
    total_completed_expenditure = sum(w.actual_cost or 0.0 for w in works if w.status == "Completed")

    works_rec_count = len(works)
    works_sanc_count = len([w for w in works if w.status in ["Sanctioned", "In-Progress", "Completed"]])
    works_in_prog_count = len([w for w in works if w.status == "In-Progress"])
    works_comp_count = len([w for w in works if w.status == "Completed"])

    utilization_pct = (total_vendor_released / total_sanctioned * 100.0) if total_sanctioned > 0 else 0.0

    return {
        "portal_name": "MPLADS - eSAKSHI Public Citizen Dashboard",
        "official_source": "Ministry of Statistics and Programme Implementation (MoSPI)",
        "portal_url": "https://mplads.mospi.gov.in/digigov/dashboard.html",
        "tenure_scope": tenure or "All Tenures",
        "state_scope": state or "All India",
        "total_mps_covered": len(mps),
        "total_allocated_limit_cr": round(total_allocated_limit / 10000000.0, 2),
        "total_recommended_cr": round(total_recommended / 10000000.0, 2),
        "total_sanctioned_cr": round(total_sanctioned / 10000000.0, 2),
        "total_vendor_released_cr": round(total_vendor_released / 10000000.0, 2),
        "total_completed_expenditure_cr": round(total_completed_expenditure / 10000000.0, 2),
        "utilization_percentage": round(utilization_pct, 1),
        "works_metrics": {
            "total_works_recommended": works_rec_count,
            "total_works_sanctioned": works_sanc_count,
            "total_works_in_progress": works_in_prog_count,
            "total_works_completed": works_comp_count,
            "sanction_rate_pct": round((works_sanc_count / max(1, works_rec_count)) * 100.0, 1),
            "completion_rate_pct": round((works_comp_count / max(1, works_sanc_count)) * 100.0, 1)
        }
    }

@router.get("/mps")
def list_digigov_mps(
    tenure: Optional[str] = None,
    state: Optional[str] = None,
    constituency: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Search MP Profiles with exact DigiGov columns (Allocated Limit, Amount Recommended, Sanctioned, Vendor Released, Works Counts).
    """
    query = db.query(MP)

    if tenure and tenure != "All":
        query = query.filter(MP.tenure == tenure)
    if state and state != "All":
        query = query.filter(MP.state == state)
    if constituency and constituency != "All":
        query = query.filter(MP.constituency == constituency)
    if search:
        s = f"%{search}%"
        query = query.filter((MP.name.ilike(s)) | (MP.constituency.ilike(s)) | (MP.party.ilike(s)))

    mps = query.order_by(MP.state.asc(), MP.constituency.asc()).all()
    results = []

    for m in mps:
        works = db.query(Work).filter(Work.mp_id == m.mp_id).all()
        rec_count = len(works)
        sanc_count = len([w for w in works if w.status in ["Sanctioned", "In-Progress", "Completed"]])
        in_prog_count = len([w for w in works if w.status == "In-Progress"])
        comp_count = len([w for w in works if w.status == "Completed"])
        
        open_alerts = db.query(AnomalyAlert).filter(
            AnomalyAlert.entity_id == m.mp_id, AnomalyAlert.status == "Open"
        ).count()

        results.append({
            "mp_id": m.mp_id,
            "mp_name": m.name,
            "house": m.house,
            "tenure": m.tenure,
            "state": m.state,
            "constituency": m.constituency,
            "party": m.party,
            "term_start": m.term_start,
            "term_end": m.term_end,
            "allocated_limit_cr": round((m.allocated_limit or 250000000.0) / 10000000.0, 2),
            "amount_recommended_cr": round(m.total_recommended / 10000000.0, 2),
            "amount_sanctioned_cr": round(m.total_sanctioned / 10000000.0, 2),
            "vendor_payments_released_cr": round(m.total_released / 10000000.0, 2),
            "amount_utilized_cr": round(m.total_utilized / 10000000.0, 2),
            "works_recommended": rec_count,
            "works_sanctioned": sanc_count,
            "works_in_progress": in_prog_count,
            "works_completed": comp_count,
            "utilization_percentage": round((m.total_utilized / max(1.0, m.total_sanctioned)) * 100.0, 1),
            "uc_pending_flag": m.uc_pending_flag,
            "risk_score": m.composite_risk_score,
            "risk_band": m.risk_band,
            "open_alerts_count": open_alerts
        })

    return results

@router.get("/constituencies")
def list_digigov_constituencies(db: Session = Depends(get_db)):
    """
    Returns list of all states and constituencies available in the eSAKSHI portal dataset.
    """
    mps = db.query(MP).all()
    state_constituency_map = defaultdict(set)
    tenures = set()

    for m in mps:
        state_constituency_map[m.state].add(m.constituency)
        if m.tenure:
            tenures.add(m.tenure)

    return {
        "tenures": sorted(list(tenures)),
        "states": sorted(list(state_constituency_map.keys())),
        "constituency_map": {k: sorted(list(v)) for k, v in state_constituency_map.items()}
    }

@router.get("/export")
def export_digigov_dataset(
    tenure: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Exports full eSAKSHI DigiGov dataset in official CSV format.
    """
    works_q = db.query(Work)
    if tenure and tenure != "All":
        works_q = works_q.filter(Work.tenure == tenure)
    if state and state != "All":
        works_q = works_q.filter(Work.state == state)

    works = works_q.all()
    mps_map = {m.mp_id: m for m in db.query(MP).all()}
    agencies_map = {a.agency_id: a for a in db.query(ImplementingAgency).all()}

    lines = [
        "Tenure,State,Constituency,MP Name,House,Party,Work ID,Category,Description,Sanction Order No,Sanction Date,Sanctioned Amount (INR),Estimated Cost (INR),Actual Expenditure (INR),Implementing Agency,Agency Type,Status,Completion Date,GPS Coordinates,Geo Photos Uploaded,Risk Score,Risk Band"
    ]

    for w in works:
        mp = mps_map.get(w.mp_id)
        ag = agencies_map.get(w.implementing_agency_id)
        
        mp_name = f'"{mp.name}"' if mp else '""'
        house = mp.house if mp else "LS"
        party = mp.party if mp else ""
        ag_name = f'"{ag.name}"' if ag else '""'
        ag_type = ag.type if ag else "Govt Dept"
        desc = f'"{w.description.replace(chr(34), chr(39))}"'
        sanc_no = f'"{w.sanction_order_no or ""}"'

        lines.append(
            f"{w.tenure},{w.state},{w.district},{mp_name},{house},{party},{w.work_id},{w.category},{desc},{sanc_no},{w.sanction_date or ''},{w.sanctioned_amount},{w.estimated_cost},{w.actual_cost},{ag_name},{ag_type},{w.status},{w.completion_date or ''},{w.lat} {w.long},{w.photos_count or 2},{w.risk_score},{w.risk_band}"
        )

    csv_content = "\n".join(lines)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=eSAKSHI_MPLADS_MoSPI_Dataset.csv"}
    )
