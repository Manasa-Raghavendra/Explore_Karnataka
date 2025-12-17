from datetime import datetime

def attraction_doc(data):
    return {
        "name": data.get("name"),
        "category": data.get("category"),
        "description": data.get("description"),
        "eco_score": data.get("eco_score"),
        "images": data.get("images", []),
        "videos": data.get("videos", []),
        "audio_story_url": data.get("audio_story_url"),
        "tags": data.get("tags", []),
        "best_season": data.get("best_season"),
        "map_url": data.get("map_url"),
        "ar_model_url": data.get("ar_model_url"),
        "created_at": datetime.utcnow()
    }
