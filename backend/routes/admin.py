from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from app import mongo

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/check", methods=["GET"])
@jwt_required()
def check_admin():
    """
    Verifies if the logged-in user is an admin.
    JWT stores only user ID → fetch full user from DB.
    """
    uid = get_jwt_identity()

    try:
        # Find user by ObjectId or fallback to string ID
        user = None
        if ObjectId.is_valid(uid):
            user = mongo.db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            user = mongo.db.users.find_one({"_id": uid})

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.get("role") != "admin":
            return jsonify({"error": "Access denied, admin only"}), 403

        return jsonify({"message": "Welcome Admin!", "user": {"name": user["name"], "email": user["email"]}}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
