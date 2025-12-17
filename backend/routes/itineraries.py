# routes/itinerary.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from extentions import mongo
import datetime

itinerary_bp = Blueprint("itinerary", __name__)

# Get all itineraries for the logged-in user
# Get all itineraries for the logged-in user
@itinerary_bp.route("", methods=["GET"])
@jwt_required()
def get_itineraries():
    uid = get_jwt_identity()

    try:
        itineraries = list(mongo.db.itineraries.find({"user_id": ObjectId(uid)}))
        results = []

        for i in itineraries:
            attraction = mongo.db.attractions.find_one({"_id": ObjectId(i["attraction_id"])})
            if attraction:
                results.append({
                    "id": str(i["_id"]),
                    "attraction_id": str(attraction["_id"]),
                    "name": attraction.get("name", "Unknown"),
                    "category": attraction.get("category", "Unknown"),
                    "images": attraction.get("images", []),
                    "best_season": attraction.get("best_season", "All Year")
                })

        return jsonify(results), 200
    except Exception as e:
        print("❌ Error loading itineraries:", e)
        return jsonify({"error": str(e)}), 500


# Add an attraction to the logged-in user’s itinerary
@itinerary_bp.route("", methods=["POST"])
@jwt_required()
def add_itinerary():
    uid = get_jwt_identity()
    data = request.get_json()
    attraction_id = data.get("attraction_id")

    if not attraction_id:
        return jsonify({"error": "Attraction ID is required"}), 400

    # Check if attraction already exists in user's itinerary
    existing = mongo.db.itineraries.find_one({
        "user_id": ObjectId(uid),
        "attraction_id": attraction_id
    })
    if existing:
        return jsonify({"error": "Already added"}), 400

    entry = {
        "user_id": ObjectId(uid),
        "attraction_id": attraction_id,
        "created_at": datetime.datetime.utcnow()
    }

    mongo.db.itineraries.insert_one(entry)
    return jsonify({"message": "Attraction added to itinerary"}), 201


# Delete itinerary item
@itinerary_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_itinerary(id):
    uid = get_jwt_identity()
    result = mongo.db.itineraries.delete_one({
        "_id": ObjectId(id),
        "user_id": ObjectId(uid)
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Itinerary not found"}), 404

    return jsonify({"message": "Itinerary removed"}), 200
