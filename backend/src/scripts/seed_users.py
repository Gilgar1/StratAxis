import asyncio
from sqlmodel import Session, select
from src.config.database import engine, async_session
from src.models.user import User, UserRole
from src.utils.security import get_password_hash

async def seed_users():
    async with async_session() as session:
        # Check if users already exist
        result = await session.execute(select(User).where(User.email == "admin@strataxis.com"))
        if result.scalar_one_or_none():
            print("Users already seeded.")
            return

        print("Seeding test users...")
        
        users = [
            User(
                email="admin@strataxis.com",
                password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                first_name="System",
                last_name="Admin"
            ),
            User(
                email="free@strataxis.com",
                password=get_password_hash("free123"),
                role=UserRole.FREE_USER,
                first_name="Free",
                last_name="User"
            ),
            User(
                email="paid@strataxis.com",
                password=get_password_hash("paid123"),
                role=UserRole.PAID_USER,
                first_name="Paid",
                last_name="User"
            )
        ]
        
        for user in users:
            session.add(user)
            
        await session.commit()
        print("Successfully seeded 3 test users.")

if __name__ == "__main__":
    asyncio.run(seed_users())
