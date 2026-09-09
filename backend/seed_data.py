import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, engine
from backend.models import MP, Work, ImplementingAgency, FundRelease, UtilizationCertificate, AnomalyAlert, User
from backend.auth import get_password_hash
from backend.ml.pipeline import pipeline_instance

STATES_DISTRICTS = {
    "Maharashtra": [
        {"district": "Nashik", "lat": 19.9975, "long": 73.7898},
        {"district": "Pune", "lat": 18.5204, "long": 73.8567},
        {"district": "Nagpur", "lat": 21.1458, "long": 79.0882},
        {"district": "Aurangabad", "lat": 19.8762, "long": 75.3433}
    ],
    "Uttar Pradesh": [
        {"district": "Varanasi", "lat": 25.3176, "long": 82.9739},
        {"district": "Lucknow", "lat": 26.8467, "long": 80.9462},
        {"district": "Gorakhpur", "lat": 26.7606, "long": 83.3732},
        {"district": "Prayagraj", "lat": 25.4358, "long": 81.8463}
    ],
    "Tamil Nadu": [
        {"district": "Coimbatore", "lat": 11.0168, "long": 76.9558},
        {"district": "Madurai", "lat": 9.9252, "long": 78.1198},
        {"district": "Chennai", "lat": 13.0827, "long": 80.2707},
        {"district": "Salem", "lat": 11.6643, "long": 78.1460}
    ],
    "Karnataka": [
        {"district": "Bengaluru Rural", "lat": 13.2847, "long": 77.5877},
        {"district": "Mysuru", "lat": 12.2958, "long": 76.6394},
        {"district": "Dharwad", "lat": 15.4589, "long": 75.0078}
    ],
    "Odisha": [
        {"district": "Cuttack", "lat": 20.4625, "long": 85.8828},
        {"district": "Bhubaneswar", "lat": 20.2961, "long": 85.8245},
        {"district": "Sambalpur", "lat": 21.4669, "long": 83.9812}
    ],
    "Rajasthan": [
        {"district": "Jaipur", "lat": 26.9124, "long": 75.7873},
        {"district": "Jodhpur", "lat": 26.2389, "long": 73.0243},
        {"district": "Kota", "lat": 25.2138, "long": 75.8648}
    ],
    "Telangana": [
        {"district": "Warangal", "lat": 17.9689, "long": 79.5941},
        {"district": "Hyderabad", "lat": 17.3850, "long": 78.4867},
        {"district": "Karimnagar", "lat": 18.4386, "long": 79.1288}
    ],
    "Gujarat": [
        {"district": "Surat", "lat": 21.1702, "long": 72.8311},
        {"district": "Rajkot", "lat": 22.3039, "long": 70.8022},
        {"district": "Vadodara", "lat": 22.3072, "long": 73.1812}
    ],
    "West Bengal": [
        {"district": "Kolkata North", "lat": 22.5726, "long": 88.3639},
        {"district": "Howrah", "lat": 22.5958, "long": 88.2636},
        {"district": "Darjeeling", "lat": 27.0410, "long": 88.2663}
    ],
    "Bihar": [
        {"district": "Patna", "lat": 25.5941, "long": 85.1376},
        {"district": "Gaya", "lat": 24.7914, "long": 85.0002},
        {"district": "Muzaffarpur", "lat": 26.1209, "long": 85.3647},
        {"district": "Begusarai", "lat": 25.4182, "long": 86.1272}
    ],
    "Kerala": [
        {"district": "Thiruvananthapuram", "lat": 8.5241, "long": 76.9366},
        {"district": "Kochi", "lat": 9.9312, "long": 76.2673},
        {"district": "Kozhikode", "lat": 11.2588, "long": 75.7804}
    ]
}

MP_SEEDS = [
    # 18th Lok Sabha (2024–2029)
    {"mp_id": "MP-LS-0101", "name": "Rajesh Sharma", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Maharashtra", "constituency": "Nashik", "party": "BJP"},
    {"mp_id": "MP-LS-0102", "name": "Priya Deshmukh", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Maharashtra", "constituency": "Pune", "party": "NCP"},
    {"mp_id": "MP-LS-0103", "name": "Nitin Gadkari", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Maharashtra", "constituency": "Nagpur", "party": "BJP"},
    {"mp_id": "MP-LS-0201", "name": "Narendra Modi", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Uttar Pradesh", "constituency": "Varanasi", "party": "BJP"},
    {"mp_id": "MP-LS-0202", "name": "Sanjay Yadav", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Uttar Pradesh", "constituency": "Lucknow", "party": "SP"},
    {"mp_id": "MP-LS-0203", "name": "Rahul Gandhi", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Uttar Pradesh", "constituency": "Rae Bareli", "party": "INC"},
    {"mp_id": "MP-LS-0301", "name": "S. Iyer", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Tamil Nadu", "constituency": "Coimbatore", "party": "DMK"},
    {"mp_id": "MP-LS-0302", "name": "M. Alagappan", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Tamil Nadu", "constituency": "Madurai", "party": "AIADMK"},
    {"mp_id": "MP-LS-0303", "name": "Shashi Tharoor", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Kerala", "constituency": "Thiruvananthapuram", "party": "INC"},
    {"mp_id": "MP-LS-0401", "name": "R. K. Hegde", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Karnataka", "constituency": "Bengaluru Rural", "party": "INC"},
    {"mp_id": "MP-LS-0402", "name": "V. Shivanna", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Karnataka", "constituency": "Mysuru", "party": "BJP"},
    {"mp_id": "MP-LS-0501", "name": "B. Das", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Odisha", "constituency": "Cuttack", "party": "BJD"},
    {"mp_id": "MP-LS-0502", "name": "Dharmendra Pradhan", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Odisha", "constituency": "Sambalpur", "party": "BJP"},
    {"mp_id": "MP-LS-0601", "name": "Mahendra Singh Rathore", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Rajasthan", "constituency": "Jaipur", "party": "BJP"},
    {"mp_id": "MP-LS-0701", "name": "K. Reddy", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Telangana", "constituency": "Warangal", "party": "INC"},
    {"mp_id": "MP-LS-0702", "name": "G. Venkatesh", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Telangana", "constituency": "Hyderabad", "party": "BRS"},
    {"mp_id": "MP-LS-0801", "name": "N. K. Patel", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Gujarat", "constituency": "Surat", "party": "BJP"},
    {"mp_id": "MP-LS-0901", "name": "Subir Banerjee", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "West Bengal", "constituency": "Kolkata North", "party": "AITC"},
    {"mp_id": "MP-LS-1001", "name": "Rameshwar Prasad", "house": "LS", "tenure": "18th Lok Sabha (2024-2029)", "state": "Bihar", "constituency": "Patna", "party": "JD(U)"},

    # 17th Lok Sabha (2019–2024 / 2023–24 eSAKSHI)
    {"mp_id": "MP-17LS-01", "name": "Devendra B. Patil", "house": "LS", "tenure": "17th Lok Sabha (2019-2024)", "state": "Maharashtra", "constituency": "Nagpur", "party": "BJP"},
    {"mp_id": "MP-17LS-02", "name": "K. Murugan", "house": "LS", "tenure": "17th Lok Sabha (2019-2024)", "state": "Tamil Nadu", "constituency": "Salem", "party": "DMK"},
    {"mp_id": "MP-17LS-03", "name": "Girraj Singh", "house": "LS", "tenure": "17th Lok Sabha (2019-2024)", "state": "Bihar", "constituency": "Begusarai", "party": "BJP"},
    {"mp_id": "MP-17LS-04", "name": "Supriya Sule", "house": "LS", "tenure": "17th Lok Sabha (2019-2024)", "state": "Maharashtra", "constituency": "Baramati", "party": "NCP"},

    # Rajya Sabha MPs
    {"mp_id": "MP-RS-001", "name": "Dr. Arvinda Swaminathan", "house": "RS", "tenure": "Rajya Sabha", "state": "Tamil Nadu", "constituency": "Statewide (RS)", "party": "Nominated"},
    {"mp_id": "MP-RS-002", "name": "Harishankar Joshi", "house": "RS", "tenure": "Rajya Sabha", "state": "Maharashtra", "constituency": "Statewide (RS)", "party": "BJP"},
    {"mp_id": "MP-RS-003", "name": "Dr. S. Jaishankar", "house": "RS", "tenure": "Rajya Sabha", "state": "Gujarat", "constituency": "Statewide (RS)", "party": "BJP"},
    {"mp_id": "MP-RS-004", "name": "Jairam Ramesh", "house": "RS", "tenure": "Rajya Sabha", "state": "Karnataka", "constituency": "Statewide (RS)", "party": "INC"}
]

AGENCY_TEMPLATES = [
    {"name_suffix": "Public Works Division (PWD)", "type": "Govt Dept"},
    {"name_suffix": "Rural Development & Panchayat Raj Agency", "type": "Govt Dept"},
    {"name_suffix": "Jal Nigam / Water Supply Board", "type": "PSU"},
    {"name_suffix": "Municipal Corporation Project Cell", "type": "Local Body"},
    {"name_suffix": "Gramin Vikas Seva Trust", "type": "Trust"},
    {"name_suffix": "Shikshan & Samaj Kalyan Society", "type": "Society"}
]

PERMISSIBLE_SECTOR_TEMPLATES = [
    {"cat": "Drinking Water", "tpl": "Installation of 5000 LPH solar powered RO drinking water plant and community distribution kiosk at {loc}"},
    {"cat": "Drinking Water", "tpl": "Construction of overhead drinking water storage tank and pipeline extension at {loc}"},
    {"cat": "Roads & Pathways", "tpl": "Construction of 1.2 km cement concrete approach road and drainage culvert connecting {loc}"},
    {"cat": "Roads & Pathways", "tpl": "Upgradation and paver block pathway laying with stormwater drain at {loc}"},
    {"cat": "Sanitation", "tpl": "Construction of 10-seater community sanitary complex with bio-digester tank at {loc}"},
    {"cat": "Education", "tpl": "Construction of 3 additional smart classrooms, science lab and library block at Govt High School {loc}"},
    {"cat": "Public Health", "tpl": "Procurement of advanced neonatal ICU diagnostic equipment and pathology lab upgrades for PHC {loc}"},
    {"cat": "Community Infrastructure", "tpl": "Construction of multi-purpose community hall and cyclone shelter facility at {loc}"},
    {"cat": "Community Infrastructure", "tpl": "Installation of 40 units high-mast LED solar street lighting poles across {loc}"},
    {"cat": "Irrigation & Water Conservation", "tpl": "Construction of masonry check dam and recharge percolation pond at {loc}"},
    {"cat": "Sports & Youth", "tpl": "Development of rural open sports ground with running track and open-air gymnasium at {loc}"}
]

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("Seeding database with 350+ realistic MPLADS records...")
        # Clear old tables
        db.query(AnomalyAlert).delete()
        db.query(FundRelease).delete()
        db.query(UtilizationCertificate).delete()
        db.query(Work).delete()
        db.query(ImplementingAgency).delete()
        db.query(MP).delete()
        db.query(User).delete()
        db.commit()

        # 1. Seed Users
        users = [
            User(username="ministry", hashed_password=get_password_hash("admin123"), full_name="S. C. Garg (Central Nodal Officer)", email="cna-mplads@mospi.gov.in", role="ministry"),
            User(username="auditor", hashed_password=get_password_hash("audit123"), full_name="K. Ramanathan (CAG Principal Director of Audit)", email="auditor-cag@gov.in", role="auditor"),
            User(username="sna_mh", hashed_password=get_password_hash("state123"), full_name="Deepak Patil (State Nodal Officer MH)", email="sna-mh@gov.in", role="state_nodal", state="Maharashtra"),
            User(username="da_nashik", hashed_password=get_password_hash("dist123"), full_name="Jalaj Sharma IAS (District Magistrate Nashik)", email="dm-nashik@gov.in", role="district_authority", state="Maharashtra", district="Nashik"),
            User(username="mp_rsharma", hashed_password=get_password_hash("mp123"), full_name="Rajesh Sharma (Hon'ble MP)", email="r.sharma.mp@sansad.nic.in", role="mp", state="Maharashtra", district="Nashik", mp_id="MP-LS-0101")
        ]
        db.add_all(users)
        db.commit()

        # 2. Seed Implementing Agencies
        agency_objects = []
        agency_lookup = {}  # (state, district) -> list of agencies
        ag_counter = 1

        for state, d_list in STATES_DISTRICTS.items():
            for d_info in d_list:
                dist = d_info["district"]
                for tmpl in AGENCY_TEMPLATES:
                    ag_id = f"IA-{state[:2].upper()}-{ag_counter:03d}"
                    ag_name = f"{dist} {tmpl['name_suffix']}"
                    ag = ImplementingAgency(
                        agency_id=ag_id,
                        name=ag_name,
                        type=tmpl["type"],
                        district=dist,
                        state=state,
                        total_works_handled=0,
                        total_sanctioned_amount=0.0,
                        flagged_works_count=0,
                        hhi_concentration_score=0.0,
                        risk_band="Low"
                    )
                    agency_objects.append(ag)
                    agency_lookup.setdefault((state, dist), []).append(ag)
                    ag_counter += 1

        db.add_all(agency_objects)
        db.commit()

        # 3. Seed MPs
        mp_objects = []
        for m_data in MP_SEEDS:
            mp_obj = MP(
                mp_id=m_data["mp_id"],
                name=m_data["name"],
                house=m_data["house"],
                tenure=m_data.get("tenure", "18th Lok Sabha (2024-2029)"),
                state=m_data["state"],
                constituency=m_data["constituency"],
                party=m_data["party"],
                term_start="2024-06-04" if "18th" in m_data.get("tenure", "") else ("2019-06-04" if "17th" in m_data.get("tenure", "") else "2022-04-03"),
                term_end="2029-06-03" if "18th" in m_data.get("tenure", "") else ("2024-06-03" if "17th" in m_data.get("tenure", "") else "2028-04-02"),
                annual_entitlement=50000000.0,  # ₹5 Crore
                allocated_limit=250000000.0,    # ₹25 Crore 5-yr entitlement
                total_recommended=0.0,
                total_sanctioned=0.0,
                total_released=0.0,
                total_utilized=0.0,
                works_recommended_count=0,
                works_sanctioned_count=0,
                works_completed_count=0,
                works_in_progress_count=0,
                uc_pending_flag=False,
                composite_risk_score=0.0,
                risk_band="Low"
            )
            mp_objects.append(mp_obj)
            db.add(mp_obj)
        db.commit()

        # 4. Generate 350+ Works, Fund Releases, and UCs with deliberate anomalies
        work_objects = []
        release_objects = []
        uc_objects = []

        used_work_ids = set()
        payment_id_seq = 80100
        uc_id_seq = 90100

        def add_work(w: Work):
            used_work_ids.add(w.work_id)
            work_objects.append(w)

        # Case A: Work with massive Cost Overrun (WK-40521 under Rajesh Sharma)
        add_work(Work(
            work_id="WK-40521",
            mp_id="MP-LS-0101",
            state="Maharashtra",
            district="Nashik",
            category="Roads & Pathways",
            description="Widening and bituminization of Dindori rural link road with storm water masonry drain (km 0/0 to 2/4)",
            recommended_date="2024-08-10",
            sanction_order_no="NASH/MPLAD/2024/098",
            sanction_date="2024-09-01",
            sanctioned_amount=4500000.0,
            estimated_cost=2200000.0,
            actual_cost=4650000.0,  # 111% overrun!
            implementing_agency_id=agency_lookup[("Maharashtra", "Nashik")][0].agency_id,
            status="Completed",
            completion_date="2025-05-15",
            lat=19.9982,
            long=73.7915,
            is_outside_constituency=False,
            financial_year="2024-25"
        ))

        # Case B: Duplicate / Tender Split Works (WK-40498 & WK-40499 in Pune)
        add_work(Work(
            work_id="WK-40498",
            mp_id="MP-LS-0102",
            state="Maharashtra",
            district="Pune",
            category="Drinking Water",
            description="Supply and installation of 5000 LPH RO water plant with stainless steel storage kiosk at Kothrud Ward 12",
            recommended_date="2024-07-12",
            sanction_order_no="PUN/MPLAD/2024/112",
            sanction_date="2024-08-05",
            sanctioned_amount=1850000.0,
            estimated_cost=1850000.0,
            actual_cost=1850000.0,
            implementing_agency_id=agency_lookup[("Maharashtra", "Pune")][2].agency_id,
            status="In-Progress",
            lat=18.5085,
            long=73.8120,
            is_outside_constituency=False,
            financial_year="2024-25"
        ))
        add_work(Work(
            work_id="WK-40499",
            mp_id="MP-LS-0102",
            state="Maharashtra",
            district="Pune",
            category="Drinking Water",
            description="Supply and installation of 5000 LPH RO water plant with stainless steel storage kiosk at Kothrud Ward 12 sector B",
            recommended_date="2024-07-20",
            sanction_order_no="PUN/MPLAD/2024/115",
            sanction_date="2024-08-10",
            sanctioned_amount=1900000.0,
            estimated_cost=1900000.0,
            actual_cost=1900000.0,
            implementing_agency_id=agency_lookup[("Maharashtra", "Pune")][2].agency_id,
            status="In-Progress",
            lat=18.5090,  # ~65 meters away!
            long=73.8125,
            is_outside_constituency=False,
            financial_year="2024-25"
        ))

        # Case C: UC Overdue & Installment 2 Release without prior UC (WK-40402 under K. Reddy)
        add_work(Work(
            work_id="WK-40402",
            mp_id="MP-LS-0701",
            state="Telangana",
            district="Warangal",
            category="Sanitation",
            description="Construction of modern automated bio-digester public toilet complex near Hanamkonda junction",
            recommended_date="2024-07-01",
            sanction_order_no="WGL/MPLAD/2024/044",
            sanction_date="2024-07-20",
            sanctioned_amount=3200000.0,
            estimated_cost=3200000.0,
            actual_cost=3200000.0,
            implementing_agency_id=agency_lookup[("Telangana", "Warangal")][3].agency_id,
            status="Completed",
            completion_date="2024-11-10",
            lat=17.9712,
            long=79.5960,
            is_outside_constituency=False,
            financial_year="2024-25"
        ))
        release_objects.append(FundRelease(
            payment_id=f"PAY-{payment_id_seq}",
            work_id="WK-40402",
            installment_no=1,
            amount=1600000.0,
            release_date="2024-08-01",
            vendor_ref="VR-WGL-901",
            uc_verified=True
        ))
        payment_id_seq += 1
        release_objects.append(FundRelease(
            payment_id=f"PAY-{payment_id_seq}",
            work_id="WK-40402",
            installment_no=2,
            amount=1600000.0,
            release_date="2024-12-15",
            vendor_ref="VR-WGL-944",
            uc_verified=False  # Violation: Released without 80% UC!
        ))
        payment_id_seq += 1

        # Case D: Category Violation under B. Das (WK-40311 in Cuttack)
        add_work(Work(
            work_id="WK-40311",
            mp_id="MP-LS-0501",
            state="Odisha",
            district="Cuttack",
            category="Commercial",
            description="Construction of commercial shopping complex and luxury guest house building for private trust",
            recommended_date="2024-09-15",
            sanction_order_no="CTC/MPLAD/2024/204",
            sanction_date="2024-10-01",
            sanctioned_amount=3800000.0,
            estimated_cost=3800000.0,
            actual_cost=3800000.0,
            implementing_agency_id=agency_lookup[("Odisha", "Cuttack")][4].agency_id,
            status="In-Progress",
            lat=20.4630,
            long=85.8840,
            is_outside_constituency=False,
            financial_year="2024-25"
        ))

        # Case E: Outside constituency limit breach (> ₹25 Lakh) under S. Iyer (WK-40377)
        add_work(Work(
            work_id="WK-40377",
            mp_id="MP-LS-0301",
            state="Tamil Nadu",
            district="Madurai",
            category="Roads & Pathways",
            description="Construction of 2.8 km high-capacity heavy vehicle arterial bypass road linking outside industrial zone",
            recommended_date="2024-08-22",
            sanction_order_no="MDU/MPLAD/2024/180",
            sanction_date="2024-09-10",
            sanctioned_amount=4200000.0,  # ₹42 Lakh > ₹25 Lakh limit!
            estimated_cost=4200000.0,
            actual_cost=4200000.0,
            implementing_agency_id=agency_lookup[("Tamil Nadu", "Madurai")][0].agency_id,
            status="In-Progress",
            lat=9.9280,
            long=78.1210,
            is_outside_constituency=True,
            financial_year="2024-25"
        ))

        # Case F: Trust lifetime limit breach (> ₹50 Lakh) under Anand Verma (Varanasi)
        trust_agency = agency_lookup[("Uttar Pradesh", "Varanasi")][4]  # Trust
        for t_idx, t_amt in enumerate([2400000.0, 2200000.0, 1800000.0]):
            add_work(Work(
                work_id=f"WK-4028{t_idx+1}",
                mp_id="MP-LS-0201",
                state="Uttar Pradesh",
                district="Varanasi",
                category="Education",
                description=f"Infrastructure enhancement and building construction phase {t_idx+1} for rural training centre",
                recommended_date=f"2024-07-1{t_idx}",
                sanction_order_no=f"VNS/MPLAD/2024/07{t_idx}",
                sanction_date=f"2024-08-0{t_idx+1}",
                sanctioned_amount=t_amt,
                estimated_cost=t_amt,
                actual_cost=t_amt,
                implementing_agency_id=trust_agency.agency_id,
                status="In-Progress",
                lat=25.3180 + t_idx * 0.005,
                long=82.9740 + t_idx * 0.005,
                is_outside_constituency=False,
                financial_year="2024-25"
            ))

        # Case G: In-Progress work delayed > 1 year (> 365 days) (WK-40155 in Jaipur)
        add_work(Work(
            work_id="WK-40155",
            mp_id="MP-LS-0601",
            state="Rajasthan",
            district="Jaipur",
            category="Public Health",
            description="Construction of 50-bed sub-district maternity care extension wing at Sanganer hospital",
            recommended_date="2023-08-05",
            sanction_order_no="JPR/MPLAD/2023/305",
            sanction_date="2023-09-01",
            sanctioned_amount=4800000.0,
            estimated_cost=4800000.0,
            actual_cost=4800000.0,
            implementing_agency_id=agency_lookup[("Rajasthan", "Jaipur")][0].agency_id,
            status="In-Progress",
            lat=26.9130,
            long=75.7880,
            is_outside_constituency=False,
            financial_year="2023-24"
        ))

        # Seed UC objects for overdue tracking
        for mp in mp_objects:
            if mp.mp_id in ["MP-LS-0701", "MP-LS-0202"]:
                uc_objects.append(UtilizationCertificate(
                    uc_id=f"UC-{uc_id_seq}",
                    mp_id=mp.mp_id,
                    financial_year="2023-24",
                    amount_certified=25000000.0,
                    submitted_date=None,
                    status="overdue",
                    days_overdue=random.choice([75, 115]),
                    audit_certificate_attached=False
                ))
                uc_id_seq += 1
                mp.uc_pending_flag = True
            else:
                uc_objects.append(UtilizationCertificate(
                    uc_id=f"UC-{uc_id_seq}",
                    mp_id=mp.mp_id,
                    financial_year="2023-24",
                    amount_certified=25000000.0,
                    submitted_date="2024-05-15",
                    status="verified",
                    days_overdue=0,
                    audit_certificate_attached=True
                ))
                uc_id_seq += 1

        locations_pool = [
            "Gram Panchayat Khadakvasla", "Taluka Mohol Village", "Bavdhan Sector 4",
            "Ward 14 Gandhi Nagar", "Zilla Parishad School Complex", "Mankhurd Rural Belt",
            "Ramnagar Basti", "Kishangarh Sector 2", "Venkateshwara Colony", "Narasimha Hills",
            "Shanti Nagar", "Mahatma Phule Chowk", "Shivaji Nagar East", "Netaji Ward 9",
            "Kalyani Gram", "Gokuldham", "Sundarban Block 2", "Kaveri River Bank Hamlet",
            "Cauvery Enclave", "Periyar Memorial Road", "Anna Nagar West", "Ambedkar Basti"
        ]

        # Fill remaining works cleanly
        seq_num = 1
        while len(work_objects) < 360:
            candidate_id = f"WK-{50000 + seq_num}"
            seq_num += 1
            if candidate_id in used_work_ids:
                continue

            mp = random.choice(mp_objects)
            d_list = STATES_DISTRICTS[mp.state]
            d_info = random.choice(d_list)
            dist = d_info["district"]
            ag_list = agency_lookup.get((mp.state, dist), [])
            agency = random.choice(ag_list) if ag_list else agency_objects[0]
            
            sector_item = random.choice(PERMISSIBLE_SECTOR_TEMPLATES)
            loc = random.choice(locations_pool)
            desc = sector_item["tpl"].format(loc=loc)

            r_month = random.randint(4, 11)
            r_day = random.randint(1, 28)
            rec_date = f"2024-{r_month:02d}-{r_day:02d}"
            sanc_date = f"2024-{min(12, r_month+1):02d}-{r_day:02d}"

            cost_est = random.choice([800000.0, 1200000.0, 1500000.0, 2000000.0, 2500000.0, 3200000.0, 4500000.0])
            status_choice = random.choices(["Completed", "In-Progress", "Sanctioned"], weights=[0.45, 0.45, 0.10])[0]
            
            actual_cost = cost_est
            comp_date = None
            if status_choice == "Completed":
                actual_cost = cost_est * random.choice([0.98, 1.0, 1.02, 1.04])
                comp_date = f"2025-{random.randint(1, 4):02d}-{random.randint(1, 28):02d}"

            lat_jitter = d_info["lat"] + (random.random() - 0.5) * 0.08
            long_jitter = d_info["long"] + (random.random() - 0.5) * 0.08

            w = Work(
                work_id=candidate_id,
                mp_id=mp.mp_id,
                state=mp.state,
                district=dist,
                category=sector_item["cat"],
                description=desc,
                recommended_date=rec_date,
                sanction_order_no=f"{dist[:3].upper()}/MPLAD/2024/{seq_num % 1000:03d}",
                sanction_date=sanc_date,
                sanctioned_amount=cost_est,
                estimated_cost=cost_est,
                actual_cost=actual_cost,
                implementing_agency_id=agency.agency_id,
                status=status_choice,
                completion_date=comp_date,
                lat=round(lat_jitter, 5),
                long=round(long_jitter, 5),
                is_outside_constituency=False,
                financial_year="2024-25"
            )
            add_work(w)

            payment_id_seq += 1
            inst1_amt = cost_est * 0.5
            release_objects.append(FundRelease(
                payment_id=f"PAY-{payment_id_seq}",
                work_id=w.work_id,
                installment_no=1,
                amount=inst1_amt,
                release_date=sanc_date,
                vendor_ref=f"VR-{dist[:3].upper()}-{payment_id_seq % 10000}",
                uc_verified=True
            ))

            if status_choice in ["Completed", "In-Progress"]:
                payment_id_seq += 1
                inst2_amt = actual_cost - inst1_amt
                release_objects.append(FundRelease(
                    payment_id=f"PAY-{payment_id_seq}",
                    work_id=w.work_id,
                    installment_no=2,
                    amount=inst2_amt,
                    release_date=comp_date if comp_date else "2025-01-10",
                    vendor_ref=f"VR-{dist[:3].upper()}-{payment_id_seq % 10000}",
                    uc_verified=True
                ))

        db.add_all(work_objects)
        db.add_all(release_objects)
        db.add_all(uc_objects)
        db.commit()

        # Update MP totals
        for mp in mp_objects:
            mp_works = [w for w in work_objects if w.mp_id == mp.mp_id]
            mp.total_recommended = sum(w.estimated_cost for w in mp_works)
            mp.total_sanctioned = sum(w.sanctioned_amount for w in mp_works)
            mp.total_released = sum(w.actual_cost for w in mp_works if w.status in ["In-Progress", "Completed"])
            mp.total_utilized = sum(w.actual_cost for w in mp_works if w.status == "Completed")
            mp.works_recommended_count = len(mp_works)
            mp.works_sanctioned_count = len([w for w in mp_works if w.status in ["Sanctioned", "In-Progress", "Completed"]])
            mp.works_completed_count = len([w for w in mp_works if w.status == "Completed"])
            mp.works_in_progress_count = len([w for w in mp_works if w.status == "In-Progress"])

        db.commit()
        print(f"Successfully seeded {len(work_objects)} works, {len(agency_objects)} agencies, and {len(mp_objects)} MPs across all tenures.")
        
        # Execute ML pipeline over newly seeded data
        print("Executing Initial ML & Anomaly Detection Pipeline...")
        res = pipeline_instance.run_full_pipeline(db)
        print(f"Initial ML pipeline run completed successfully: {res['total_alerts_generated']} alerts generated ({res['critical_count']} critical, {res['high_count']} high).")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
