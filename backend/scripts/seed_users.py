import asyncio
import os
import sys

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.supabase import supabase
from src.config.database import async_session
from src.models.user import User, UserRole
from sqlmodel import select
from datetime import datetime

USERS = [
    {
        "role": UserRole.ADMIN,
        "email": "admin@strataxis.com",
        "password": "Password123!",
        "first_name": "Admin",
        "last_name": "User"
    },
    {
        "role": UserRole.PAID_USER,
        "email": "pro@strataxis.com",
        "password": "Password123!",
        "first_name": "Pro",
        "last_name": "User"
    },
    {
        "role": UserRole.FREE_USER,
        "email": "free@strataxis.com",
        "password": "Password123!",
        "first_name": "Free",
        "last_name": "User"
    }
]

async def seed_users():
    print("Starting user seeding...")
    
    async with async_session() as session:
        for user_data in USERS:
            email = user_data["email"]
            role = user_data["role"]
            password = user_data["password"]
            
            print(f"Processing {email} ({role})...")
            
            user = None
            
            # 1. Register in Supabase
            try:
                auth_response = await supabase.sign_up({
                    "email": email,
                    "password": password,
                    "options": {
                        "data": {
                            "first_name": user_data["first_name"],
                            "last_name": user_data["last_name"]
                        }
                    }
                })
                    
                if auth_response.user:
                     # New user created or existing user returned
                     sb_user = auth_response.user
                     print(f"  - Supabase User ID: {sb_user.id}")
                     
                     # Check/Create local user
                     user = await session.get(User, sb_user.id)
                     if not user:
                         user = User(
                            id=sb_user.id,
                            email=email,
                            role=role,
                            first_name=user_data["first_name"],
                            last_name=user_data["last_name"],
                            is_active=True,
                            password="supabase_managed",
                            created_at=datetime.utcnow()
                         )
                         session.add(user)
                         print("  - Created local DB record.")
                else:
                    print("  - User exists in Supabase (or signup failed silently). Checking local DB by email...")
                    # If user exists in Supabase, sign_up might return None user if confirmation is required or duplicate.
                    # Let's try to login to get the ID if we really need it, OR assume they exist locally if we ran this before.
                    
                    # Check by email
                    statement = select(User).where(User.email == email)
                    result = await session.execute(statement)
                    user = result.scalar_one_or_none()
                    
                    if not user:
                        print("  - WARNING: User exists in Supabase but NOT in local DB. Cannot retrieve UUID to sync without login. Skipping role update.")
                        continue
                        
            except Exception as e:
                print(f"  - Error interacting with Supabase: {e}")
                continue

            # 2. Update Role
            if user:
                if user.role != role:
                    user.role = role
                    session.add(user)
                    print(f"  - Updated role to {role}.")
                else:
                    print(f"  - Role is already correct ({role}).")
            
        await session.commit()
        print("Seeding complete.")

if __name__ == "__main__":
    try:
        asyncio.run(seed_users())
    except Exception as e:
        print(f"An error occurred: {e}")
