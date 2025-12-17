from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

def user_doc(data):
    return {
        "name": data.get("name"),
        "email": data.get("email"),
        "password": generate_password_hash(data.get("password")),
        "role": data.get("role", "user"),  # 'admin' or 'user'
        "created_at": datetime.utcnow()
    }

def verify_password(stored_password, provided_password):
    return check_password_hash(stored_password, provided_password)
