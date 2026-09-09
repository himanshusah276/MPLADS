from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from backend.database import get_db
from backend.models import Work, MP, ImplementingAgency, FundRelease, AnomalyAlert
from backend.schemas import WorkResponse, WorkCreate, WorkUpdate
from backend.auth import get_current_user

router = APIRouter(prefix="/works", tags=["Works Management"])

@router.get("", response_model=List[WorkResponse])
def list_works(
    state: Optional[str] = None,
    district: Optional[str] = None,
    mp_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    risk_band: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Work)
    if state and state != "All":
        query = query.filter(Work.state == state)
    if district and district != "All":
        query = query.filter(Work.district == district)
    if mp_id and mp_id != "All":
        query = query.filter(Work.mp_id == mp_id)
    if category and category != "All":
        query = query.filter(Work.category == category)
    if status and status != "All":
        query = query.filter(Work.status == status)
    if risk_band and risk_band != "All":
        query = query.filter(Work.risk_band == risk_band)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Work.work_id.ilike(s)) |
            (Work.description.ilike(s)) |
            (Work.district.ilike(s)) |
            (Work.sanction_order_no.ilike(s))
        )

    works = query.order_by(Work.risk_score.desc(), Work.recommended_date.desc()).offset(offset).limit(limit).all()
    results = []

    # Cache agencies and MPs
    agencies_map = {a.agency_id: a.name for a in db.query(ImplementingAgency).all()}
    mps_map = {m.mp_id: m.name for m in db.query(MP).all()}

    for w in works:
        alerts_count = db.query(AnomalyAlert).filter(
            AnomalyAlert.entity_id == w.work_id, AnomalyAlert.status == "Open"
        ).count()

        resp = WorkResponse.model_validate(w)
        resp.agency_name = agencies_map.get(w.implementing_agency_id, "N/A")
        resp.mp_name = mps_map.get(w.mp_id, "N/A")
        resp.alerts_count = alerts_count
        results.append(resp)

    return results

@router.get("/{work_id}")
def get_work_detail(work_id: str, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.work_id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    mp = db.query(MP).filter(MP.mp_id == work.mp_id).first()
    agency = db.query(ImplementingAgency).filter(ImplementingAgency.agency_id == work.implementing_agency_id).first()
    releases = db.query(FundRelease).filter(FundRelease.work_id == work_id).order_by(FundRelease.installment_no.asc()).all()
    alerts = db.query(AnomalyAlert).filter(AnomalyAlert.entity_id == work_id).order_by(AnomalyAlert.risk_score.desc()).all()

    # Calculate overrun metrics
    overrun_amount = max(0.0, work.actual_cost - work.estimated_cost)
    overrun_pct = round((overrun_amount / max(1.0, work.estimated_cost)) * 100.0, 1)

    # Work execution timeline steps
    timeline = [
        {"step": "Recommendation", "date": work.recommended_date, "status": "Completed", "by": mp.name if mp else "Hon'ble MP"},
        {"step": "Sanction Order", "date": work.sanction_date, "status": "Completed" if work.sanction_date else "Pending", "order_no": work.sanction_order_no},
        {"step": "Fund Release (Inst 1)", "date": releases[0].release_date if releases else None, "status": "Completed" if releases else "Pending", "amount": releases[0].amount if releases else 0.0},
        {"step": "Fund Release (Inst 2)", "date": releases[1].release_date if len(releases) > 1 else None, "status": "Completed" if len(releases) > 1 else "Pending", "amount": releases[1].amount if len(releases) > 1 else 0.0},
        {"step": "Work Execution & Completion", "date": work.completion_date, "status": work.status, "agency": agency.name if agency else "N/A"},
        {"step": "Utilization Certificate (UC)", "date": work.completion_date, "status": "Filed" if work.status == "Completed" else "Pending"}
    ]

    return {
        "work": work,
        "mp": mp,
        "agency": agency,
        "releases": releases,
        "alerts": alerts,
        "timeline": timeline,
        "cost_analytics": {
            "sanctioned_amount": work.sanctioned_amount,
            "estimated_cost": work.estimated_cost,
            "actual_cost": work.actual_cost,
            "overrun_amount": overrun_amount,
            "overrun_pct": overrun_pct,
            "is_overrun": overrun_pct > 15.0
        }
    }

@router.post("", response_model=WorkResponse)
def create_work(payload: WorkCreate, db: Session = Depends(get_db)):
    work_id = f"WK-{uuid.uuid4().hex[:6].upper()}"
    new_work = Work(
        work_id=work_id,
        mp_id=payload.mp_id,
        state=payload.state,
        district=payload.district,
        category=payload.category,
        description=payload.description,
        recommended_date=payload.recommended_date,
        sanction_order_no=payload.sanction_order_no,
        sanction_date=payload.sanction_date,
        sanctioned_amount=payload.sanctioned_amount,
        estimated_cost=payload.estimated_cost,
        actual_cost=payload.actual_cost or payload.estimated_cost,
        implementing_agency_id=payload.implementing_agency_id,
        status=payload.status,
        completion_date=payload.completion_date,
        lat=payload.lat,
        long=payload.long,
        is_outside_constituency=payload.is_outside_constituency,
        financial_year=payload.financial_year
    )
    db.add(new_work)
    db.commit()
    db.refresh(new_work)

    resp = WorkResponse.from_orm(new_work)
    return resp

@router.patch("/{work_id}", response_model=WorkResponse)
def update_work(work_id: str, payload: WorkUpdate, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.work_id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    update_dict = payload.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(work, k, v)

    db.commit()
    db.refresh(work)
    return WorkResponse.from_orm(work)
