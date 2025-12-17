from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS

mongo = PyMongo()
jwt = JWTManager()

def init_cors(app):
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )
