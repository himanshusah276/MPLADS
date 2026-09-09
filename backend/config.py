import os

class Settings:
    PROJECT_NAME: str = "eSAKSHI MPLADS Anomaly & Fraud Detection Platform"
    PROJECT_VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mplads_esakshi_super_secret_jwt_key_2026_gov_in")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Defaults to local SQLite, but effortlessly accepts Postgres DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mplads.db")
    
    # ML Model Configs
    CONTAMINATION_RATE: float = 0.08
    TFIDF_SIMILARITY_THRESHOLD: float = 0.65
    GEO_PROXIMITY_METERS: float = 800.0
    TRUST_LIFETIME_LIMIT_INR: float = 5000000.0  # ₹50 Lakh
    OUTSIDE_CONSTITUENCY_LIMIT_INR: float = 2500000.0  # ₹25 Lakh
    ANNUAL_ENTITLEMENT_INR: float = 50000000.0  # ₹5 Crore
    UC_RELEASE_THRESHOLD_PCT: float = 80.0

settings = Settings()
