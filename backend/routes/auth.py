# routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extentions import mongo
from bson import ObjectId
import datetime
import os

auth_bp = Blueprint("auth", __name__)


def _find_user_by_id(uid: str):
    """
    Try to find user by ObjectId or by string _id (if you use custom string IDs).
    Returns user document or None.
    """
    try:
        if ObjectId.is_valid(uid):
            return mongo.db.users.find_one({"_id": ObjectId(uid)})
    except Exception:
        # If conversion failed for any reason, fall through to string lookup
        pass
    return mongo.db.users.find_one({"_id": uid})


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    Request JSON: { "name": "...", "email": "...", "password": "...", "admin_code": "..." }
    """
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    admin_code = (data.get("admin_code") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # ✅ Check admin code
    ADMIN_CODE = os.getenv("ADMIN_CODE", "EXPKARNATAKA2025")
    role = "admin" if admin_code == ADMIN_CODE else "user"

    hashed = generate_password_hash(password)
    user_doc = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }

    result = mongo.db.users.insert_one(user_doc)
    uid = str(result.inserted_id)

    token = create_access_token(identity=uid, expires_delta=datetime.timedelta(hours=12))

    user_public = {"id": uid, "name": name, "email": email, "role": role}
    return jsonify({"message": "Registration successful", "token": token, "user": user_public}), 201




@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login endpoint.
    Request JSON: { "email": "...", "password": "..." }
    Responses:
      - 200: { token, user }
      - 404: {"error": "Username does not exist"}   <-- when email not found
      - 401: {"error": "Invalid password"}         <-- when password wrong
    """
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Username does not exist"}), 404

    if not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid password"}), 401

    identity = str(user["_id"])
    expires = datetime.timedelta(hours=12)
    access_token = create_access_token(identity=identity, expires_delta=expires)

    user_public = {
        "id": identity,
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user")
    }

    return jsonify({"message": "Login successful", "token": access_token, "user": user_public}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = _find_user_by_id(uid)

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_public = {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "bio": user.get("bio", ""),
        "interests": user.get("interests", []),
        "profile_completed": user.get("profile_completed", False)
    }

    return jsonify({"user": user_public}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    user = _find_user_by_id(uid)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(force=True, silent=True) or {}

    bio = data.get("bio", "").strip()
    interests = data.get("interests", [])

    if not isinstance(interests, list):
        return jsonify({"error": "Interests must be a list"}), 400

    mongo.db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "bio": bio,
                "interests": interests,
                "profile_completed": True,
            }
        }
    )

    return jsonify({
        "message": "Profile updated successfully",
        "profile": {
            "bio": bio,
            "interests": interests
        }
    }), 200
