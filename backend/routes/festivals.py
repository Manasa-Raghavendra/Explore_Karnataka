from flask import Blueprint, jsonify, request
from extentions import mongo
from bson import ObjectId
from bson.errors import InvalidId
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.festival_model import festival_doc


festivals_bp = Blueprint("festivals", __name__)

# 🧩 Reuse admin check
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


# -------------------- PUBLIC --------------------
@festivals_bp.route("/", methods=["GET"])
def get_all_festivals():
    festivals = list(mongo.db.festivals.find())
    for f in festivals:
        f["_id"] = str(f["_id"])
    return jsonify(festivals), 200


@festivals_bp.route("/<id>", methods=["GET"])
def get_festival(id):
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    f = mongo.db.festivals.find_one(query)
    if not f:
        return jsonify({"error": "Not found"}), 404
    f["_id"] = str(f["_id"])
    return jsonify(f), 200


# -------------------- ADMIN --------------------
@festivals_bp.route("", methods=["POST"])
@admin_only
def add_festival():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "Invalid data"}), 400
    doc = festival_doc(data)
    result = mongo.db.festivals.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return jsonify(doc), 201


@festivals_bp.route("/<id>", methods=["PUT"])
@admin_only
def update_festival(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data"}), 400
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    result = mongo.db.festivals.update_one(query, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Festival updated"}), 200


@festivals_bp.route("/<id>", methods=["DELETE"])
@admin_only
def delete_festival(id):
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    result = mongo.db.festivals.delete_one(query)
    if result.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Festival deleted"}), 200
