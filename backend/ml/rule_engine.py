import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

# Official Annexure-VIII Permissible Categories and Keywords
PERMISSIBLE_CATEGORIES = {
    "Drinking Water": ["drinking water", "tube well", "borewell", "hand pump", "piped water", "water tank", "ro plant", "jal jeevan", "water purification"],
    "Sanitation": ["sanitation", "public toilet", "community toilet", "swachh bharat", "drainage", "sewer line", "solid waste", "bio-toilet"],
    "Roads & Pathways": ["road", "cc road", "paver block", "culvert", "small bridge", "approach road", "bituminous road", "street pathway"],
    "Education": ["school", "classroom", "library", "laboratory", "smart class", "anganwadi", "desks", "school building", "vocational training"],
    "Public Health": ["health centre", "phc", "dispensary", "ambulance", "hospital equipment", "maternity ward", "oxygen plant", "clinic"],
    "Irrigation & Water Conservation": ["irrigation", "check dam", "canal lining", "water harvesting", "pond deepening", "percolation tank"],
    "Community Infrastructure": ["community hall", "panchayat ghar", "cremation ground", "burial ground", "bus shelter", "solar street light", "street light"],
    "Sports & Youth": ["sports ground", "open gym", "stadium seating", "youth club infrastructure", "badminton court", "sports equipment"],
    "Disaster Relief": ["flood shelter", "cyclone shelter", "disaster mitigation", "drainage desilting"]
}

PROHIBITED_KEYWORDS = [
    "commercial", "shopping complex", "shopping mall", "private trust office", "temple", 
    "mosque", "church", "gurudwara", "private bungalow", "guest house",
    "residential quarters for private", "swimming pool for club", "private club", 
    "grant-in-aid to private individual", "land acquisition", "monument statue", 
    "lavish gate", "honorarium payment", "inventory purchase for resale"
]

def parse_date(date_str: str) -> datetime:
    if not date_str:
        return datetime.now(timezone.utc)
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.now(timezone.utc)

class MPLADSRuleEngine:
    """
    Deterministic rule engine strictly implementing official MPLADS guidelines (eSAKSHI).
    """

    @staticmethod
    def check_uc_release_threshold(
        installment_no: int,
        prior_certified_expenditure: float,
        prior_released_amount: float
    ) -> Tuple[bool, str]:
        """
        Rule R1: 2nd Installment (or next year's 1st) released only after UC >= 80% of prior installment.
        """
        if installment_no >= 2:
            if prior_released_amount <= 0:
                return False, "No prior release found, cannot validate 80% UC compliance."
            utilization_pct = (prior_certified_expenditure / prior_released_amount) * 100.0
            if utilization_pct < 80.0:
                return True, (
                    f"Statutory violation under Para 4.3: Installment {installment_no} released "
                    f"while prior expenditure certification is only {utilization_pct:.1f}% "
                    f"(Statutory mandatory threshold: ≥ 80.0%)."
                )
        return False, ""

    @staticmethod
    def check_trust_lifetime_limit(
        agency_type: str,
        cumulative_sanctioned_to_agency: float,
        current_work_amount: float
    ) -> Tuple[bool, str]:
        """
        Rule R2: Max ₹50 lakh lifetime to a single Trust/Society.
        """
        if agency_type in ["Trust", "Society"]:
            total_after_work = cumulative_sanctioned_to_agency + current_work_amount
            if total_after_work > 5000000.0:  # ₹50 Lakhs
                return True, (
                    f"Statutory violation under Para 3.14 (Trust & Society ceiling): Cumulative sanctions "
                    f"reach ₹{total_after_work/100000:.2f} Lakh, exceeding the maximum permissible lifetime limit of ₹50.0 Lakh per Trust/Society."
                )
        return False, ""

    @staticmethod
    def check_outside_constituency_limit(
        is_outside_constituency: bool,
        sanctioned_amount: float
    ) -> Tuple[bool, str]:
        """
        Rule R3: Max ₹25 lakh for works recommended outside the MP's constituency/state.
        """
        if is_outside_constituency and sanctioned_amount > 2500000.0:  # ₹25 Lakhs
            return True, (
                f"Statutory violation under Para 3.12 (Outside Constituency works): Work sanctioned for "
                f"₹{sanctioned_amount/100000:.2f} Lakh exceeds the statutory maximum ceiling of ₹25.0 Lakh for outside-constituency works."
            )
        return False, ""

    @staticmethod
    def check_permissible_category(
        category: str,
        description: str
    ) -> Tuple[bool, str]:
        """
        Rule R4: Work must fall under permissible Annexure-VIII durable community asset categories.
        """
        desc_lower = (description or "").lower()
        cat_lower = (category or "").lower()

        # Check explicit prohibited keywords
        for p_word in PROHIBITED_KEYWORDS:
            if p_word in desc_lower or p_word in cat_lower:
                return True, (
                    f"Prohibited expenditure violation under Annexure-VIII: Description contains restricted "
                    f"non-durable/private asset item '{p_word}'. MPLADS funds cannot be utilized for private/commercial/religious entities."
                )

        # Check matching category
        matched_category = False
        for valid_cat, keywords in PERMISSIBLE_CATEGORIES.items():
            if valid_cat.lower() in cat_lower or any(k in desc_lower for k in keywords):
                matched_category = True
                break

        if not matched_category:
            return True, (
                f"Category compliance warning under Annexure-VIII: The description '{description[:60]}...' "
                f"does not clearly match standard permissible durable community asset sectors (Water, Sanitation, Roads, Education, Health)."
            )

        return False, ""

    @staticmethod
    def check_execution_delay(
        status: str,
        sanction_date_str: str,
        completion_date_str: str = None
    ) -> Tuple[bool, str]:
        """
        Rule R5: Works must normally be completed within 1 year (365 days) of sanction.
        """
        if not sanction_date_str:
            return False, ""
        
        s_date = parse_date(sanction_date_str)
        now = datetime.now(timezone.utc)
        if s_date.tzinfo is None:
            s_date = s_date.replace(tzinfo=timezone.utc)

        if status in ["In-Progress", "Sanctioned"]:
            elapsed_days = (now - s_date).days
            if elapsed_days > 365:
                return True, (
                    f"Guideline timeline breach under Para 5.2: Work has been '{status}' for {elapsed_days} days "
                    f"since sanction ({s_date.strftime('%d-%b-%Y')}), exceeding the mandatory 1-year completion deadline."
                )
        return False, ""

    @staticmethod
    def check_uc_aging(
        submitted_date_str: str,
        completion_date_str: str,
        status: str
    ) -> Tuple[int, str, str]:
        """
        Rule R6: UC aging tracking (0-30 days, 31-90 days, 90+ days overdue).
        """
        if status in ["submitted", "verified"]:
            return 0, "Low", "UC submitted and compliant."
        
        if not completion_date_str:
            return 0, "Low", "Work pending completion."
            
        c_date = parse_date(completion_date_str)
        now = datetime.now(timezone.utc)
        if c_date.tzinfo is None:
            c_date = c_date.replace(tzinfo=timezone.utc)
            
        days_since_completion = (now - c_date).days
        
        if days_since_completion > 30:
            days_overdue = days_since_completion - 30
            if days_overdue > 90:
                return days_overdue, "Critical", (
                    f"Critical Audit Delay: Utilization Certificate is {days_overdue} days overdue (completed on {c_date.strftime('%d-%b-%Y')}). "
                    f"Immediate audit recovery notice required under CAG guidelines."
                )
            elif days_overdue > 30:
                return days_overdue, "High", (
                    f"High Audit Delay: Utilization Certificate is {days_overdue} days overdue. Work completed >60 days ago without CA certificate."
                )
            else:
                return days_overdue, "Medium", (
                    f"Moderate Delay: Utilization Certificate is {days_overdue} days overdue past the 30-day post-completion filing window."
                )
        return 0, "Low", "Within normal 30-day post-completion filing window."
