from datetime import datetime

def festival_doc(data):
    return {
        "name": data.get("name"),
        "date": data.get("date"),
        "description": data.get("description"),
        "location": data.get("location"),
        "image": data.get("image"),
        "created_at": datetime.utcnow()
    }
