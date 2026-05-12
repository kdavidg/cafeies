#!/usr/bin/env python
"""
Standalone script to create a Django superuser (root) without interactive prompts.
Run with: python create_superuser.py
"""
import os
import django

# Point Django at the correct settings module before any ORM usage
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafe_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

USERNAME = 'root'
EMAIL = 'root@example.com'
PASSWORD = 'root123456'

User = get_user_model()

# Remove any existing user with this username to avoid IntegrityError on re-runs
if User.objects.filter(username=USERNAME).exists():
    User.objects.filter(username=USERNAME).delete()
    print(f"Existing '{USERNAME}' user deleted.")

User.objects.create_superuser(username=USERNAME, email=EMAIL, password=PASSWORD)
print(f"Superuser '{USERNAME}' created successfully.")
