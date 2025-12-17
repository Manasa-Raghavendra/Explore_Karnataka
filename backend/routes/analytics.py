# routes/analytics.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import random

# Blueprint setup
analytics_bp = Blueprint("analytics", __name__)

# -----------------------------------------
# ADMIN ANALYTICS ROUTE  ✅ PHASE 1
# -----------------------------------------
@analytics_bp.route("/admin/analytics", methods=["GET"])
@jwt_required()
def admin_analytics():
    from app import mongo  # import mongo within function to avoid circular import

    uid = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(uid)})

    if not user or user.get("role") != "admin":
        return jsonify({"error": "Access denied"}), 403

    # --- Counts ---
    attractions_count = mongo.db.attractions.count_documents({})
    festivals_count = mongo.db.festivals.count_documents({})

    # --- Average eco score ---
    attractions = list(mongo.db.attractions.find({}, {"eco_score": 1}))
    eco_scores = [
        a.get("eco_score", 0)
        for a in attractions
        if isinstance(a.get("eco_score"), (int, float))
    ]
    avg_eco_score = round(sum(eco_scores) / len(eco_scores), 2) if eco_scores else 0

    # --- Category distribution ---
    category_counts = {}
    for a in mongo.db.attractions.find({}, {"category": 1}):
        cat = a.get("category", "Uncategorized")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # --- Monthly visitors (mock data for now) ---
    months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    visitor_data = [
        {"month": m, "visitors": random.randint(1000, 5000)} for m in months
    ]

    return jsonify({
        "total_visitors": sum(v["visitors"] for v in visitor_data),
        "attractions_count": attractions_count,
        "festivals_count": festivals_count,
        "avg_eco_score": avg_eco_score,
        "category_distribution": category_counts,
        "visitor_trends": visitor_data,
    }), 200
