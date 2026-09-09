from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import ImplementingAgency, Work
from backend.schemas import AgencyResponse

router = APIRouter(prefix="/agencies", tags=["Implementing Agencies"])

@router.get("", response_model=List[AgencyResponse])
def list_agencies(
    state: Optional[str] = None,
    district: Optional[str] = None,
    agency_type: Optional[str] = None,
    risk_band: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ImplementingAgency)
    if state and state != "All":
        query = query.filter(ImplementingAgency.state == state)
    if district and district != "All":
        query = query.filter(ImplementingAgency.district == district)
    if agency_type and agency_type != "All":
        query = query.filter(ImplementingAgency.type == agency_type)
    if risk_band and risk_band != "All":
        query = query.filter(ImplementingAgency.risk_band == risk_band)
    if search:
        s = f"%{search}%"
        query = query.filter((ImplementingAgency.name.ilike(s)) | (ImplementingAgency.agency_id.ilike(s)))

    agencies = query.order_by(ImplementingAgency.flagged_works_count.desc(), ImplementingAgency.total_sanctioned_amount.desc()).all()
    return [AgencyResponse.model_validate(a) for a in agencies]

@router.get("/{agency_id}")
def get_agency_detail(agency_id: str, db: Session = Depends(get_db)):
    agency = db.query(ImplementingAgency).filter(ImplementingAgency.agency_id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Implementing agency not found")

    works = db.query(Work).filter(Work.implementing_agency_id == agency_id).all()
    flagged = [w for w in works if w.risk_score >= 50.0]

    return {
        "agency": agency,
        "works_count": len(works),
        "total_sanctioned": sum(w.sanctioned_amount or 0.0 for w in works),
        "total_actual_spent": sum(w.actual_cost or 0.0 for w in works),
        "flagged_works": flagged,
        "works": works
    }
