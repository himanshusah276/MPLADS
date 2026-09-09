from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    full_name: str
    state: Optional[str] = None
    district: Optional[str] = None
    mp_id: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    mp_id: Optional[str] = None

# Fund Release Schemas
class FundReleaseBase(BaseModel):
    work_id: str
    installment_no: int
    amount: float
    release_date: str
    vendor_ref: str
    uc_verified: bool = True

class FundReleaseResponse(FundReleaseBase):
    model_config = ConfigDict(from_attributes=True)
    payment_id: str

# Utilization Certificate Schemas
class UCBase(BaseModel):
    mp_id: str
    work_id: Optional[str] = None
    financial_year: str
    amount_certified: float
    submitted_date: Optional[str] = None
    status: str = "pending"
    days_overdue: int = 0
    audit_certificate_attached: bool = False

class UCResponse(UCBase):
    model_config = ConfigDict(from_attributes=True)
    uc_id: str

# Work Schemas
class WorkBase(BaseModel):
    mp_id: str
    state: str
    district: str
    category: str
    description: str
    recommended_date: str
    sanction_order_no: Optional[str] = None
    sanction_date: Optional[str] = None
    sanctioned_amount: float = 0.0
    estimated_cost: float = 0.0
    actual_cost: float = 0.0
    implementing_agency_id: Optional[str] = None
    status: str = "Recommended"
    completion_date: Optional[str] = None
    lat: float
    long: float
    is_outside_constituency: bool = False
    financial_year: str = "2024-25"
    tenure: str = "18th Lok Sabha (2024-2029)"
    photos_count: int = 2
    document_attachment_url: Optional[str] = None

class WorkCreate(WorkBase):
    pass

class WorkUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    sanction_order_no: Optional[str] = None
    sanction_date: Optional[str] = None
    sanctioned_amount: Optional[float] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    implementing_agency_id: Optional[str] = None
    status: Optional[str] = None
    completion_date: Optional[str] = None
    is_outside_constituency: Optional[bool] = None
    tenure: Optional[str] = None

class WorkResponse(WorkBase):
    model_config = ConfigDict(from_attributes=True)

    work_id: str
    risk_score: float = 0.0
    risk_band: str = "Low"
    agency_name: Optional[str] = None
    mp_name: Optional[str] = None
    alerts_count: int = 0

# MP Schemas
class MPBase(BaseModel):
    mp_id: str
    name: str
    house: str
    tenure: str = "18th Lok Sabha (2024-2029)"
    state: str
    constituency: str
    party: str
    term_start: str
    term_end: str
    annual_entitlement: float = 50000000.0
    allocated_limit: float = 250000000.0
    total_recommended: float = 0.0
    total_sanctioned: float = 0.0
    total_released: float = 0.0
    total_utilized: float = 0.0
    works_recommended_count: int = 0
    works_sanctioned_count: int = 0
    works_completed_count: int = 0
    works_in_progress_count: int = 0
    uc_pending_flag: bool = False
    composite_risk_score: float = 0.0
    risk_band: str = "Low"

class MPResponse(MPBase):
    model_config = ConfigDict(from_attributes=True)

    works_count: int = 0
    open_alerts_count: int = 0
    utilization_percentage: float = 0.0

# Agency Schemas
class AgencyBase(BaseModel):
    agency_id: str
    name: str
    type: str
    district: str
    state: str
    total_works_handled: int = 0
    total_sanctioned_amount: float = 0.0
    flagged_works_count: int = 0
    hhi_concentration_score: float = 0.0
    risk_band: str = "Low"

class AgencyResponse(AgencyBase):
    model_config = ConfigDict(from_attributes=True)

# Anomaly Alert Schemas
class AlertBase(BaseModel):
    entity_type: str
    entity_id: str
    alert_type: str
    risk_score: float
    severity: str
    description: str
    rule_code: Optional[str] = None
    explainable_details: Optional[str] = None
    detected_on: Optional[str] = None
    status: str = "Open"
    reviewer_role: Optional[str] = None
    reviewer_comment: Optional[str] = None
    reviewed_at: Optional[str] = None

class AlertResponse(AlertBase):
    model_config = ConfigDict(from_attributes=True)

    alert_id: str
    entity_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None

class AlertTriageRequest(BaseModel):
    status: str
    comment: str
    reviewer_role: Optional[str] = "Auditor"

# Pre-check Simulation Schema
class PreCheckWorkRequest(BaseModel):
    mp_id: str
    district: str
    state: str
    category: str
    description: str
    estimated_cost: float
    implementing_agency_id: Optional[str] = None
    is_outside_constituency: bool = False
    lat: Optional[float] = None
    long: Optional[float] = None

class PreCheckViolation(BaseModel):
    rule_code: str
    rule_name: str
    severity: str
    is_blocking: bool
    explanation: str
    guideline_reference: str

class PreCheckWorkResponse(BaseModel):
    is_compliant: bool
    risk_score: float
    risk_band: str
    violations: List[PreCheckViolation]
    warnings: List[str]
    recommendation: str
