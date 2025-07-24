from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User as UserModel
from dto.user import UserCreate, UserRole
from services.user_service import UserService
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin_user(db_session: AsyncSession, user_service: UserService):
    admin_username = "OussemaJaouadi"
    admin_email = "oussemajawadi2@gmail.com"
    admin_password = settings.ADMIN_DEFAULT_PASSWORD # This should be changed immediately after first login

    # Check if admin user already exists
    result = await db_session.execute(select(UserModel).where(
        (UserModel.username == admin_username) | (UserModel.email == admin_email)
    ))
    existing_admin = result.scalar_one_or_none()

    if not existing_admin:
        print(f"✨ Admin user '{admin_username}' not found. Creating... ✨")
        admin_user_data = UserCreate(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            role=UserRole.ADMIN
        )
        try:
            # Directly create user without sending confirmation email for seeder
            hashed_password = pwd_context.hash(admin_user_data.password)
            admin_user = UserModel(
                username=admin_user_data.username,
                email=admin_user_data.email,
                hashed_password=hashed_password,
                role=admin_user_data.role,
                account_confirmed=True # Admin user is confirmed by default
            )
            db_session.add(admin_user)
            await db_session.commit()
            await db_session.refresh(admin_user)
            print(f"✅ Admin user '{admin_username}' created successfully. ✅")
        except Exception as e:
            await db_session.rollback()
            print(f"❌ Error creating admin user: {e} ❌")
    else:
        print(f"ℹ️ Admin user '{admin_username}' already exists. Skipping creation. ℹ️")
