import os
import pymongo
from pymongo import MongoClient

mongo_uri = os.getenv('MONGO_URL') or os.getenv('MONGODB_URI') or "mongodb://localhost:27017/"

client = MongoClient(mongo_uri)
db = client['cafe_db']