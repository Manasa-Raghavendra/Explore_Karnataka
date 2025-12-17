from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import os

from groq import Groq
from extentions import mongo

chat_bp = Blueprint("chat", __name__)

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

@chat_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.get_json()

    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Fetch user
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    interests = user.get("interests", [])

    # 🧠 SYSTEM PROMPT
    system_prompt = f"""
You are a smart tourism assistant for Karnataka tourism.

User interests:
{', '.join(interests) if interests else 'General tourism'}

Rules:
- Answer only about Karnataka tourism, culture, food, festivals, travel.
- Prefer recommendations matching user interests.
- Be friendly, concise, and helpful.
- Politely refuse non-tourism questions.
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = completion.choices[0].message.content

        return jsonify({
            "reply": reply,
            "interests_used": interests
        })

    except Exception as e:
        print("Groq error:", e)
        return jsonify({
            "error": "AI service unavailable",
            "details": str(e)
        }), 500
