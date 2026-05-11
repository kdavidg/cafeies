# core/db_connection.py
from pymongo import MongoClient

# Conectamos con tu MongoDB local
client = MongoClient('mongodb://localhost:27017/')
db = client['cafe_db']