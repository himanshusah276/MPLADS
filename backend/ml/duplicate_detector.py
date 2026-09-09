import math
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class DuplicateWorkDetector:
    """
    Detects potential duplicate sanctions or split work contracts using NLP text similarity
    on descriptions combined with geospatial proximity.
    """

    def __init__(self, text_similarity_threshold: float = 0.65, max_distance_meters: float = 800.0):
        self.text_similarity_threshold = text_similarity_threshold
        self.max_distance_meters = max_distance_meters
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))

    def detect_duplicates(self, works_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not works_data or len(works_data) < 2:
            return []

        descriptions = [w.get("description", "") for w in works_data]
        try:
            tfidf_matrix = self.vectorizer.fit_transform(descriptions)
            cos_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        except Exception:
            return []

        alerts = []
        n = len(works_data)
        processed_pairs = set()

        for i in range(n):
            for j in range(i + 1, n):
                w1 = works_data[i]
                w2 = works_data[j]

                # Pair identifier
                pair_key = tuple(sorted([w1["work_id"], w2["work_id"]]))
                if pair_key in processed_pairs:
                    continue

                text_sim = float(cos_sim_matrix[i, j])
                
                # Check spatial distance if valid lat/long exists
                lat1, lon1 = float(w1.get("lat", 0.0)), float(w1.get("long", 0.0))
                lat2, lon2 = float(w2.get("lat", 0.0)), float(w2.get("long", 0.0))
                
                has_coords = (lat1 != 0.0 and lon1 != 0.0 and lat2 != 0.0 and lon2 != 0.0)
                distance_m = haversine_distance(lat1, lon1, lat2, lon2) if has_coords else 999999.0

                # Same MP or same District
                same_mp = (w1.get("mp_id") == w2.get("mp_id"))
                same_district = (w1.get("district") == w2.get("district"))

                # Trigger condition:
                # 1. High text similarity (> 0.70) AND close proximity (< 800m)
                # 2. Extremely high text similarity (> 0.88) in same district
                is_duplicate = False
                reason = ""
                risk_score = 0.0

                if text_sim >= self.text_similarity_threshold and has_coords and distance_m <= self.max_distance_meters:
                    is_duplicate = True
                    risk_score = min(96.0, 60.0 + (text_sim * 30.0) + max(0, (800 - distance_m) / 800 * 10))
                    reason = (
                        f"Geospatial + NLP Duplicate Anomaly: Near-identical scope of work "
                        f"(Text Cosine Similarity: {text_sim*100:.1f}%) located only {distance_m:.0f}m apart "
                        f"from Work ID '{w2['work_id']}' in {w1.get('district')}. "
                        f"Indicators suggest deliberate tender splitting or duplicate billing for the same asset."
                    )
                elif text_sim >= 0.88 and same_district:
                    is_duplicate = True
                    risk_score = min(92.0, 65.0 + text_sim * 25.0)
                    reason = (
                        f"High Textual Similarity Duplicate: Description has {text_sim*100:.1f}% lexical overlap "
                        f"with Work ID '{w2['work_id']}' under {w1.get('district')} district. "
                        f"Suspected re-sanction of existing work."
                    )

                if is_duplicate:
                    processed_pairs.add(pair_key)
                    severity = "Critical" if risk_score >= 85 else ("High" if risk_score >= 70 else "Medium")
                    
                    # Generate alert for w1
                    alerts.append({
                        "work_id": w1["work_id"],
                        "related_work_id": w2["work_id"],
                        "risk_score": risk_score,
                        "severity": severity,
                        "similarity_score": text_sim,
                        "distance_meters": distance_m if has_coords else None,
                        "explanation": reason
                    })

        return alerts
