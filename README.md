# PS 26102 — AI-Powered MPLADS Anomaly & Fraud Detection Platform (eSAKSHI)

An enterprise GovTech anomaly and fraud detection platform for the **Member of Parliament Local Area Development Scheme (MPLADS)**, grounded in the official **MPLADS Guidelines (2023)** and integrated with the **eSAKSHI portal** multi-role workflow.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend: React + Vite + TypeScript + Tailwind           │
│  - eSAKSHI Multi-Role Portal (Ministry, Auditor, SNA, DA, MP)           │
│  - Interactive District Risk Map & Geospatial Cluster View              │
│  - Live Work Dossier Timeline & Cost Overrun Analytics                 │
│  - Auditor Triage Drawer & Pre-Check Work Sanction Simulator            │
│  - Bilingual Toggle (EN / HI) & Audit Report PDF/CSV Generator          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API / JSON (JWT Auth)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Backend: FastAPI + SQLAlchemy ORM                     │
│  - Multi-role RBAC Middleware (Ministry, Auditor, SNA, DA, MP)         │
│  - REST APIs: /api/mps, /api/works, /api/agencies, /api/alerts, /api/uc │
│  - Audit Trail & Reviewer Comment Management                           │
│  - Auto-seeding 360+ realistic multi-year MPLADS records               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Internal Service / Engine
┌───────────────────────────────────▼────────────────────────────────────┐
│             ML & Anomaly Engine (Hybrid Explainable AI)                │
│  1. Rule Engine: 80% UC release check, ₹50L Trust limit, ₹25L outside  │
│     constituency limit, Annexure-VIII category NLP check, >1yr delay   │
│  2. Isolation Forest: Cost overrun z-score, spend velocity outliers    │
│  3. NLP & Spatial Clustering: TF-IDF + Haversine distance duplicate work│
│  4. Agency Concentration: Herfindahl-Hirschman Index (HHI)             │
│  5. Composite 0-100 Risk Score & Explainable Audit Reason Breakdown    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Explainable Hybrid AI (Statutory Rules + Statistical ML)

Government auditors distrust unexplained black-box classifiers. Our platform employs an explainable hybrid model where every single alert is linked to a statutory guideline paragraph or mathematical outlier metric:

### 1. Deterministic Guideline Rules
- **Rule R1 (Para 4.3)**: Installment 2 (and next year's 1st) is released only after a Utilization Certificate (UC) covering $\ge 80\%$ of prior expenditure is certified.
- **Rule R2 (Para 3.14)**: Lifetime ceiling of **₹50 Lakh** to any single registered Trust or Society.
- **Rule R3 (Para 3.12)**: Maximum **₹25 Lakh** cap for works recommended outside the MP's constituency/state.
- **Rule R4 (Annexure-VIII)**: NLP classifier verifying permissible durable community asset sectors (Water, Sanitation, Roads, Education, Health) vs prohibited items (commercial, private, religious).
- **Rule R5 (Para 5.2)**: Flags works delayed **> 365 days** past sanction date without completion.
- **Rule R6 (CAG Guidelines)**: Aging buckets (0–30, 31–90, 90+ days) for overdue UCs and CA audit certificates.

### 2. Machine Learning & Statistical Outliers
- **Isolation Forest Model**: Multivariate statistical outlier detector on actual/estimated cost ratio, absolute cost overrun %, and duration.
- **Duplicate & Split Tender Detector**: TF-IDF lexical cosine similarity ($> 0.65$) combined with Haversine spatial proximity ($< 800$ meters).
- **Agency Concentration (HHI)**: Computes Herfindahl-Hirschman Index ($HHI = \sum s_i^2$) across MP allocations to catch disproportionate single-agency contracts ($> 45\%$).

---

## 🚀 Quickstart (Local Launch)

### 1. Backend Service (FastAPI)
```bash
# From repository root
python3 -m pip install -r backend/requirements.txt
PYTHONPATH=. python3 backend/seed_data.py
uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Frontend Dashboard (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🐳 Docker Compose Deployment
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🧪 Automated Test Suite
Run the test suite verifying all statutory rules, duplicate detectors, and API endpoints:
```bash
PYTHONPATH=. python3 -m pytest backend/tests/ -v
```

---

## 👥 Real Stakeholder Role Views
The platform supports real eSAKSHI governance roles:
1. **Central Nodal Agency (MoSPI)**: National dashboard, countrywide risk heatmap, all-India MP leaderboard.
2. **CAG Principal Director of Audit**: Full alert triage workspace, audit trails, and official 1-click PDF audit report generator.
3. **State Nodal Authority (SNA)**: State-level filtering and agency oversight.
4. **District Authority (Nodal DA / Implementing DA)**: Feasibility checks and sanction management.
5. **Member of Parliament (MP)**: Personal entitlement utilization tracker (₹5 Cr annual budget), 80% UC release progress, and real-time Pre-Sanction Compliance Simulator.
