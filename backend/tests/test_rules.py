import pytest
from backend.ml.rule_engine import MPLADSRuleEngine
from backend.ml.duplicate_detector import haversine_distance, DuplicateWorkDetector
from backend.ml.isolation_forest_model import StatisticalAnomalyDetector
from backend.ml.agency_analyzer import AgencyConcentrationAnalyzer

def test_rule_r1_uc_release_threshold():
    engine = MPLADSRuleEngine()
    # Case: Installment 2 with only 50% expenditure certified (below 80%)
    has_v, exp = engine.check_uc_release_threshold(installment_no=2, prior_certified_expenditure=1000000.0, prior_released_amount=2500000.0)
    assert has_v is True
    assert "Statutory violation under Para 4.3" in exp
    assert "40.0%" in exp

    # Case: Installment 2 with 85% expenditure certified (compliant)
    has_v, _ = engine.check_uc_release_threshold(installment_no=2, prior_certified_expenditure=2200000.0, prior_released_amount=2500000.0)
    assert has_v is False

def test_rule_r2_trust_limit():
    engine = MPLADSRuleEngine()
    # Case: Cumulative sanctions exceed ₹50 Lakh for a Trust
    has_v, exp = engine.check_trust_lifetime_limit(agency_type="Trust", cumulative_sanctioned_to_agency=3500000.0, current_work_amount=2000000.0)
    assert has_v is True
    assert "exceeding the maximum permissible lifetime limit of ₹50.0 Lakh" in exp

    # Case: Cumulative sanctions within ₹50 Lakh
    has_v, _ = engine.check_trust_lifetime_limit(agency_type="Trust", cumulative_sanctioned_to_agency=2000000.0, current_work_amount=1500000.0)
    assert has_v is False

def test_rule_r3_outside_constituency():
    engine = MPLADSRuleEngine()
    # Case: Outside constituency work > ₹25 Lakh
    has_v, exp = engine.check_outside_constituency_limit(is_outside_constituency=True, sanctioned_amount=3500000.0)
    assert has_v is True
    assert "exceeds the statutory maximum ceiling of ₹25.0 Lakh" in exp

    # Case: Outside constituency work <= ₹25 Lakh
    has_v, _ = engine.check_outside_constituency_limit(is_outside_constituency=True, sanctioned_amount=2000000.0)
    assert has_v is False

def test_rule_r4_category_compliance():
    engine = MPLADSRuleEngine()
    # Case: Prohibited commercial asset
    has_v, exp = engine.check_permissible_category(category="Commercial", description="Construction of commercial shopping complex")
    assert has_v is True
    assert "Prohibited expenditure violation" in exp

    # Case: Compliant drinking water asset
    has_v, _ = engine.check_permissible_category(category="Drinking Water", description="Installation of 5000 LPH RO water plant and kiosk")
    assert has_v is False

def test_rule_r5_execution_delay():
    engine = MPLADSRuleEngine()
    # Case: In-Progress work sanctioned 500 days ago
    has_v, exp = engine.check_execution_delay(status="In-Progress", sanction_date_str="2023-01-01")
    assert has_v is True
    assert "exceeding the mandatory 1-year completion deadline" in exp

def test_haversine_distance():
    # Points 100 meters apart
    d = haversine_distance(19.9975, 73.7898, 19.9984, 73.7898)
    assert 90.0 < d < 120.0

def test_duplicate_detector():
    detector = DuplicateWorkDetector(text_similarity_threshold=0.65, max_distance_meters=800.0)
    works = [
        {
            "work_id": "W1", "mp_id": "MP1", "district": "Pune",
            "description": "Supply and installation of 5000 LPH solar RO drinking water plant with kiosk at Ward 12",
            "lat": 18.5204, "long": 73.8567
        },
        {
            "work_id": "W2", "mp_id": "MP1", "district": "Pune",
            "description": "Supply and installation of 5000 LPH solar RO drinking water plant with kiosk at Ward 12 sector B",
            "lat": 18.5210, "long": 73.8570  # ~75m away
        }
    ]
    alerts = detector.detect_duplicates(works)
    assert len(alerts) >= 1
    assert alerts[0]["work_id"] == "W1"
    assert "Duplicate Anomaly" in alerts[0]["explanation"]
