from dto.user import UserCreate, User, UserRole, UserLogin, UserAdminEdit
from dto.user_image import UserImageResponseDto
from models.user import User as UserModel
from models.user_image import UserImage
from utils.jwt import create_access_token
from utils.jwt import generate_account_confirmation_token, generate_password_reset_token
from sqlalchemy.future import select
from sqlalchemy import func, update
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from dto.token import TokenData, TokenPayload
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from core.config import settings

class UserService:
    def __init__(self, db_session_factory, s3_handler, image_handler, email_handler):
        self.db_session_factory = db_session_factory
        self.s3 = s3_handler
        self.image_handler = image_handler
        self.email_handler = email_handler
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    async def register_user(self, user_data: UserCreate, image_bytes: bytes = None) -> User:
        async with self.db_session_factory() as session:
            hashed_password = self.pwd_context.hash(user_data.password)
            user = UserModel(
                username=user_data.username,
                email=user_data.email,
                hashed_password=hashed_password,
                role=UserRole.USER # Default to USER role
            )
            session.add(user)
            try:
                await session.commit()
                await session.refresh(user)
            except IntegrityError:
                await session.rollback()
                raise ValueError("Username or email already exists")

            # Process and upload image only after successful user creation
            if image_bytes:
                # Automatically set the first uploaded image as active
                await self._add_profile_picture(session, user, image_bytes, is_active=True)
                await session.refresh(user)

            # Send account confirmation email
            confirmation_token = await generate_account_confirmation_token(user.id, user.email)
            confirmation_link = f"https://your-frontend-domain.com/confirm?token={confirmation_token.access_token}"
            await self.email_handler.send_to_person(
                to=user.email,
                subject="Confirm your account",
                template_name="account_confirmation.html",
                context={"username": user.username, "confirmation_link": confirmation_link}
            )
            return User.model_validate(user)

    async def login_user(self, user_login: UserLogin) -> TokenData:
        async with self.db_session_factory() as session:
            user = None
            # Try to find user by username
            result = await session.execute(select(UserModel).where(UserModel.username == user_login.username))
            user = result.scalar_one_or_none()

            # If not found by username, try to find by email if the input looks like an email
            if not user:
                from pydantic import TypeAdapter, EmailStr
                try:
                    TypeAdapter(EmailStr).validate_python(user_login.username) # Validate if it's a valid email format
                    result = await session.execute(select(UserModel).where(UserModel.email == user_login.username))
                    user = result.scalar_one_or_none()
                except ValueError:
                    # Not a valid email, so it's just a username that didn't match
                    pass

            if not user or not self.pwd_context.verify(user_login.password, user.hashed_password):
                raise ValueError("Invalid credentials")
            
            # Calculate expiration time for the token
            expiration_period_str = settings.JWT_EXPIRATION_PERIOD
            if expiration_period_str.endswith('h'):
                hours = int(expiration_period_str[:-1])
                expire = datetime.now(timezone.utc) + timedelta(hours=hours)
            elif expiration_period_str.endswith('m'):
                minutes = int(expiration_period_str[:-1])
                expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
            else:
                expire = datetime.now(timezone.utc) + timedelta(minutes=30)
            
            token_payload = TokenPayload(sub=user.id, role=user.role.value, exp=int(expire.timestamp()))
            return await create_access_token(token_payload)

    async def get_me(self, user_id: str) -> User:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            return User.model_validate(user)

    async def _add_profile_picture(self, session, user: UserModel, image_bytes: bytes, is_active: bool = False) -> UserImage:
        processed = await self.image_handler.process_image(image_bytes)
        image_hash = await self.image_handler.calculate_hash(processed)
        key = f"users/{user.id}/{image_hash}.jpg"

        # Upload to S3
        await self.s3.upload_image(key, processed)

        # Create UserImage entry
        user_image = UserImage(user_id=user.id, image_key=key, is_active=is_active)
        session.add(user_image)
        await session.flush() # To get the ID for the new image

        if is_active:
            # Deactivate all other images for this user
            await session.execute(
                update(UserImage)
                .where(UserImage.user_id == user.id, UserImage.id != user_image.id)
                .values(is_active=False)
            )
            user.active_avatar_url = key # Update user's active avatar URL

        return user_image

    async def upload_profile_picture(self, user_id: str, image_bytes: bytes) -> UserImageResponseDto:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")

            # Check current image count
            current_images_count = await session.scalar(
                select(func.count(UserImage.id)).where(UserImage.user_id == user_id)
            )

            is_active = False
            if current_images_count < 5:
                # If less than 5, add as inactive by default, user can activate later
                # Or, if it's the first image, make it active
                if current_images_count == 0:
                    is_active = True
                new_image = await self._add_profile_picture(session, user, image_bytes, is_active=is_active)
            else:
                # If 5 images, delete the oldest inactive one and add new one
                oldest_inactive_image = await session.scalar(
                    select(UserImage)
                    .where(UserImage.user_id == user_id, UserImage.is_active == False)
                    .order_by(UserImage.created_at.asc())
                    .limit(1)
                )
                if oldest_inactive_image:
                    await self.s3.delete_image(oldest_inactive_image.image_key)
                    await session.delete(oldest_inactive_image)
                    await session.flush() # Ensure deletion is processed before adding new
                    new_image = await self._add_profile_picture(session, user, image_bytes, is_active=False)
                else:
                    # If all 5 are active (shouldn't happen with current logic, but as a fallback)
                    # Or if there are no inactive images to replace, raise an error
                    raise ValueError("Maximum 5 profile pictures reached and no inactive images to replace.")

            await session.commit()
            await session.refresh(new_image)
            await session.refresh(user) # Refresh user to get updated active_avatar_url
            return UserImageResponseDto.model_validate(new_image)

    async def get_user_images(self, user_id: str) -> list[UserImageResponseDto]:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserImage).where(UserImage.user_id == user_id).order_by(UserImage.created_at.desc()))
            images = result.scalars().all()
            return [UserImageResponseDto.model_validate(img) for img in images]

    async def delete_user_image(self, user_id: str, image_id: str) -> None:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserImage).where(UserImage.id == image_id, UserImage.user_id == user_id))
            image_to_delete = result.scalar_one_or_none()
            if not image_to_delete:
                raise ValueError("Image not found or does not belong to user")

            # Prevent deleting the last active image if it's the only one
            if image_to_delete.is_active:
                active_images_count = await session.scalar(
                    select(func.count(UserImage.id)).where(UserImage.user_id == user_id, UserImage.is_active == True)
                )
                if active_images_count == 1:
                    raise ValueError("Cannot delete the last active profile picture. Please set another image as active first.")

            await self.s3.delete_image(image_to_delete.image_key)
            await session.delete(image_to_delete)
            await session.commit()

            # If the deleted image was active, set a new one as active (if available)
            if image_to_delete.is_active:
                result = await session.execute(select(UserModel).where(UserModel.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    # Find the most recent inactive image and make it active
                    new_active_image = await session.scalar(
                        select(UserImage)
                        .where(UserImage.user_id == user_id)
                        .order_by(UserImage.created_at.desc())
                        .limit(1)
                    )
                    if new_active_image:
                        new_active_image.is_active = True
                        user.active_avatar_url = new_active_image.image_key
                        await session.commit()
                        await session.refresh(user)
                    else:
                        user.active_avatar_url = None # No images left
                        await session.commit()
                        await session.refresh(user)

    async def set_active_profile_picture(self, user_id: str, image_id: str) -> UserImageResponseDto:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserImage).where(UserImage.id == image_id, UserImage.user_id == user_id))
            image_to_activate = result.scalar_one_or_none()
            if not image_to_activate:
                raise ValueError("Image not found or does not belong to user")

            if image_to_activate.is_active:
                return UserImageResponseDto.model_validate(image_to_activate) # Already active

            # Deactivate current active image for this user
            await session.execute(
                update(UserImage)
                .where(UserImage.user_id == user_id, UserImage.is_active == True)
                .values(is_active=False)
            )

            # Set new image as active
            image_to_activate.is_active = True
            await session.commit()
            await session.refresh(image_to_activate)

            # Update user's active_avatar_url
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                user.active_avatar_url = image_to_activate.image_key
                await session.commit()
                await session.refresh(user)

            return UserImageResponseDto.model_validate(image_to_activate)

    async def get_image_data(self, image_key: str) -> bytes:
        return await self.s3.get_image(image_key)

    async def delete_user_account(self, user_id: str) -> None:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            if user.images:
                # Delete all user's S3 images
                for image in user.images:
                    await self.s3.delete_image(image.image_key)
                # Cascade delete from DB is handled by relationship cascade="all, delete-orphan"
            await session.delete(user)
            await session.commit()

    async def get_all_users(self) -> list[User]:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel))
            users = result.scalars().all()
            return [User.model_validate(u) for u in users]

    async def admin_edit_user(self, user_id: str, user_data: UserAdminEdit, image_bytes: bytes = None) -> User:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            
            if image_bytes:
                # If a new image is provided, upload it and set it as active
                await self.upload_profile_picture(user_id, image_bytes)
                await session.refresh(user)

            # Iterate over provided fields in the DTO and update the user model
            for key, value in user_data.model_dump(exclude_unset=True).items():
                if hasattr(user, key):
                    setattr(user, key, value)
            await session.commit()
            await session.refresh(user)
            return User.model_validate(user)

    async def request_password_reset(self, email: str) -> None:
        """
        Send a password reset email if the user exists.
        """
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.email == email))
            user = result.scalar_one_or_none()
            if not user:
                # For security, do not reveal if email does not exist
                return
            reset_token = await generate_password_reset_token(email)
            reset_link = f"https://your-frontend-domain.com/reset-password?token={reset_token.access_token}"
            await self.email_handler.send_to_person(
                to=email,
                subject="Reset your password",
                template_name="password_reset.html",
                context={"username": user.username, "reset_link": reset_link}
            )

    async def reset_password(self, token: str, new_password: str, confirm_password: str) -> bool:
        """
        Reset the user's password if the token is valid and passwords match.
        """
        if new_password != confirm_password:
            raise ValueError("Passwords do not match")
        try:
            payload = jwt.decode(token, settings.JWT_ACCOUNT_CONFIRMATION, algorithms=["HS256"])
        except JWTError:
            raise ValueError("Invalid or expired token")
        if payload.get("type") != "password_reset":
            raise ValueError("Invalid token type")
        email = payload.get("email")
        if not email:
            raise ValueError("Token missing email")
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.email == email))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            user.hashed_password = self.pwd_context.hash(new_password)
            await session.commit()
            await self.email_handler.send_to_person(
                to=user.email,
                subject="Password Reset Successful",
                template_name="password_reset_success.html",
                context={"username": user.username}
            )
        return True

    async def confirm_account(self, token: str) -> bool:
        """
        Confirm the user's account if the token is valid.
        """
        try:
            payload = jwt.decode(token, settings.JWT_ACCOUNT_CONFIRMATION, algorithms=["HS256"])
        except JWTError:
            raise ValueError("Invalid or expired token")
        if payload.get("type") != "account_confirmation":
            raise ValueError("Invalid token type")
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise ValueError("Token missing user_id or email")
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id, UserModel.email == email))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            user.is_confirmed = True
            await session.commit()
            await self.email_handler.send_to_person(
                to=user.email,
                subject="Account Confirmed Successfully",
                template_name="account_confirmed_success.html",
                context={"username": user.username}
            )
        return True

    async def update_public_key(self, user_id: str, public_key: str) -> None:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            user.public_key = public_key
            await session.commit()

    async def get_public_key(self, user_id: str) -> str:
        async with self.db_session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
            return user.public_key