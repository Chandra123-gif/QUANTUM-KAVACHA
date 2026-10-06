import math
import time
from typing import Dict, Any, List
from collections import defaultdict

class TransactionVelocityEngine:
    """
    Real-Time Payment Velocity & Behavioral Intelligence Engine.
    Tracks multi-window transaction dynamics to flag rapid bursts, device hopping,
    and physically impossible geographic jumps.
    """
    def __init__(self):
        # In-memory window tracking by user_id and device_id
        self.user_history = defaultdict(list)
        self.device_history = defaultdict(list)

    def calculate_haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance in kilometers between two geo-coordinates."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def compute_velocity(self, txn: Dict[str, Any]) -> Dict[str, Any]:
        """Compute real-time velocity metrics for an incoming transaction."""
        user_id = txn.get("user_id", "ANON")
        device_id = txn.get("device_id", "DEV-UNKNOWN")
        amount = float(txn.get("amount", 0.0))
        lat = float(txn.get("lat", 19.0760))
        lon = float(txn.get("lon", 72.8777))
        now = time.time()

        user_txns = self.user_history[user_id]
        
        # Clean older history (> 3600 seconds)
        user_txns = [t for t in user_txns if (now - t["time"]) <= 3600]
        self.user_history[user_id] = user_txns

        # 1-minute and 10-second counts
        txns_1min = [t for t in user_txns if (now - t["time"]) <= 60]
        txns_10sec = [t for t in user_txns if (now - t["time"]) <= 10]

        amt_1min = sum(t["amount"] for t in txns_1min) + amount
        txns_count_1min = len(txns_1min) + 1
        txns_count_10sec = len(txns_10sec) + 1

        unique_devices = len(set(t["device_id"] for t in user_txns).union({device_id}))
        unique_ips = len(set(t["ip"] for t in user_txns).union({txn.get("ip", "1.1.1.1")}))
        unique_merchants = len(set(t["merchant_id"] for t in user_txns).union({txn.get("merchant_id", "M1")}))

        # Geographic velocity check (impossible travel)
        geo_jump_km_h = 0.0
        impossible_travel = False
        if user_txns:
            last_txn = user_txns[-1]
            dist_km = self.calculate_haversine_distance(last_txn["lat"], last_txn["lon"], lat, lon)
            time_diff_hours = (now - last_txn["time"]) / 3600.0
            if time_diff_hours > 0:
                geo_jump_km_h = dist_km / time_diff_hours
                if geo_jump_km_h > 800.0 and dist_km > 50.0:
                    impossible_travel = True

        # Append current transaction to memory
        self.user_history[user_id].append({
            "time": now,
            "amount": amount,
            "device_id": device_id,
            "ip": txn.get("ip", "1.1.1.1"),
            "merchant_id": txn.get("merchant_id", "M1"),
            "lat": lat,
            "lon": lon
        })

        # Calculate composite velocity risk score (0-100%)
        v_score = (
            min(40.0, (txns_count_1min / 5.0) * 40.0) +
            min(25.0, (unique_devices / 3.0) * 25.0) +
            min(20.0, (amt_1min / 100000.0) * 20.0) +
            (15.0 if impossible_travel else 0.0)
        )
        v_score = round(min(100.0, v_score), 1)

        return {
            "velocity_risk_score": v_score,
            "txns_in_1min": txns_count_1min,
            "txns_in_10sec": txns_count_10sec,
            "amount_in_1min": round(amt_1min, 2),
            "unique_devices_1h": unique_devices,
            "unique_ips_1h": unique_ips,
            "unique_merchants_1h": unique_merchants,
            "geo_jump_km_h": round(geo_jump_km_h, 1),
            "impossible_travel": impossible_travel,
            "status": "CRITICAL VELOCITY BURST" if v_score > 75.0 else ("ELEVATED VELOCITY" if v_score > 40.0 else "NORMAL")
        }

velocity_engine = TransactionVelocityEngine()
