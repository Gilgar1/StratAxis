import asyncio
import os
import sys
from sqlalchemy import text

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.database import async_session

EMAILS = [
    "admin@strataxis.com",
    "pro@strataxis.com",
    "free@strataxis.com"
]

async def confirm_users():
    print("Attempting to verify users via direct DB access...")
    
    async with async_session() as session:
        try:
            # Check if we can access auth.users
            # We use text() for raw SQL
            
            print("Updating email_confirmed_at for seeded users...")
            
            # Construct the query
            emails_str = "', '".join(EMAILS)
            stmt = text(f"UPDATE auth.users SET email_confirmed_at = NOW() WHERE email IN ('{emails_str}') AND email_confirmed_at IS NULL RETURNING email;")
            
            result = await session.execute(stmt)
            confirmed = result.all()
            
            await session.commit()
            
            if confirmed:
                print(f"Successfully confirmed {len(confirmed)} users:")
                for row in confirmed:
                    print(f" - {row[0]}")
            else:
                print("No users needed confirmation (or no users found/permission denied).")
                
        except Exception as e:
            print(f"Error accessing auth schema: {e}")
            print("NOTE: If this failed, you may need to disable 'Confirm email' in Supabase Dashboard -> Authentication -> Providers -> Email")

if __name__ == "__main__":
    try:
        asyncio.run(confirm_users())
    except Exception as e:
        print(f"An error occurred: {e}")
