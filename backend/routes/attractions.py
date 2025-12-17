from flask import Blueprint, jsonify, request
from extentions import mongo
from bson import ObjectId
from bson.errors import InvalidId
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.attraction_model import attraction_doc


attractions_bp = Blueprint("attractions", __name__)

# 🧩 Helper: check admin role
def admin_only(func):
    from functools import wraps
    @wraps(func)
    @jwt_required()
    def wrapper(*args, **kwargs):
        uid = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(uid)})
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Access denied"}), 403
        return func(*args, **kwargs)
    return wrapper


# -------------------- PUBLIC ROUTES --------------------
@attractions_bp.route("/", methods=["GET"])
def get_all_attractions():
    attractions = list(mongo.db.attractions.find())
    for a in attractions:
        a["_id"] = str(a["_id"])
    return jsonify(attractions), 200


@attractions_bp.route("/<id>", methods=["GET"])
def get_attraction(id):
    try:
        query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        a = mongo.db.attractions.find_one(query)
        if not a:
            return jsonify({"error": "Not found"}), 404
        a["_id"] = str(a["_id"])
        return jsonify(a), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------- ADMIN ROUTES --------------------
@attractions_bp.route("", methods=["POST"])
@admin_only
def add_attraction():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "Invalid data"}), 400

    doc = attraction_doc(data)
    result = mongo.db.attractions.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return jsonify(doc), 201


@attractions_bp.route("/<id>", methods=["PUT"])
@admin_only
def update_attraction(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data"}), 400
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    result = mongo.db.attractions.update_one(query, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Attraction updated"}), 200


@attractions_bp.route("/<id>", methods=["DELETE"])
@admin_only
def delete_attraction(id):
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    result = mongo.db.attractions.delete_one(query)
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Attraction deleted"}), 200
