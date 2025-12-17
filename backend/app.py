# app.py
from flask import Flask, jsonify
from dotenv import load_dotenv
from bson import ObjectId
import os

# Import extensions
from extentions import mongo, jwt, init_cors

# Load environment variables
load_dotenv()

# ----------------------------
# Initialize Flask app
# ----------------------------
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/explore_karnataka")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey123")

# Initialize extensions with app
mongo.init_app(app)
jwt.init_app(app)
init_cors(app)

# ----------------------------
# Register Blueprints
# ----------------------------
from routes.auth import auth_bp
from routes.attractions import attractions_bp
from routes.festivals import festivals_bp
from routes.analytics import analytics_bp
from routes.itineraries import itinerary_bp
from routes.image_recognition_routes import image_bp
from routes.recommendations import recommendations_bp
from routes.chat import chat_bp



app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(attractions_bp, url_prefix="/api/attractions")
app.register_blueprint(festivals_bp, url_prefix="/api/festivals")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(itinerary_bp, url_prefix="/api/itineraries")
app.register_blueprint(image_bp, url_prefix="/api/image")
app.register_blueprint(recommendations_bp, url_prefix="/api")
app.register_blueprint(chat_bp, url_prefix="/api")



# ----------------------------
# Root route
# ----------------------------
@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to Explore Karnataka API!",
        "routes": [
            "/api/attractions",
            "/api/festivals",
            "/api/admin/check"
        ]
    })

# ----------------------------
# Test DB connection
# ----------------------------
@app.route("/test_db")
def test_db():
    try:
        mongo.db.command("ping")
        return jsonify({"status": "connected", "message": "MongoDB OK!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ----------------------------
# Admin Check
# ----------------------------
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route("/api/admin/check", methods=["GET"])
@jwt_required()
def admin_check():
    uid = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.get("role") != "admin":
        return jsonify({"error": "Access denied"}), 403
    return jsonify({"message": "Welcome Admin!"}), 200

# ----------------------------
# Run app
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0",debug=True, port=5000)
