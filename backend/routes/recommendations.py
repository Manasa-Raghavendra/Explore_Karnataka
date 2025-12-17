from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from extentions import mongo

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    interests = user.get("interests", [])
    if not interests:
        return jsonify({"recommendations": []})

    # Case-insensitive category matching
    regex_list = [{"category": {"$regex": i, "$options": "i"}} for i in interests]

    attractions = list(
        mongo.db.attractions.find(
            {"$or": regex_list},
            {"name": 1, "category": 1, "images": 1, "description": 1}
        ).limit(12)
    )

    for a in attractions:
        a["_id"] = str(a["_id"])

    return jsonify({
        "user_interests": interests,
        "recommendations": attractions
    })
