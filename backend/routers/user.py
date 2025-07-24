from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request, Form
from typing import Optional
from uuid import UUID
from pydantic import EmailStr
from dto.user import UserCreate, UserResponseDto, UserResponseAdminDto, UserUpdatePublicKey, UserLogin, UserAdminEdit, UserRole
from dto.user_image import UserImageResponseDto
from fastapi.responses import Response
from services.user_service import UserService
from utils.image import ImageSecurityError
from utils.decorators import requires_auth, requires_admin, requires_no_auth


class UserRoutes:
    def __init__(self, user_service: UserService):
        self.user_service = user_service
        self.router = APIRouter(prefix="/user", tags=["user"])
        self.router.add_api_route("/register", self.register, methods=["POST"], response_model=UserResponseDto)
        self.router.add_api_route("/login", self.login, methods=["POST"])
        self.router.add_api_route("/profile-images", self.upload_profile_image, methods=["POST"], response_model=UserImageResponseDto)
        self.router.add_api_route("/profile-images", self.get_my_profile_images, methods=["GET"], response_model=list[UserImageResponseDto])
        self.router.add_api_route("/profile-images/{image_id}/data", self.get_profile_image_data, methods=["GET"], response_class=Response)
        self.router.add_api_route("/profile-images/{image_id}", self.delete_profile_image, methods=["DELETE"], response_model=dict)
        self.router.add_api_route("/profile-images/{image_id}/set-active", self.set_active_profile_image, methods=["PUT"], response_model=UserImageResponseDto)
        self.router.add_api_route("/admin/users/{user_id}/profile-images", self.admin_get_user_profile_images, methods=["GET"], response_model=list[UserImageResponseDto])
        self.router.add_api_route("/admin/users/{user_id}/profile-images/{image_id}/data", self.admin_get_user_profile_image_data, methods=["GET"], response_class=Response)
        self.router.add_api_route("/delete", self.delete_user, methods=["DELETE"], response_model=dict)
        self.router.add_api_route("/admin/delete/{user_id}", self.admin_delete_user, methods=["DELETE"], response_model=dict)
        self.router.add_api_route("/me", self.get_me, methods=["GET"], response_model=UserResponseDto)
        self.router.add_api_route("/all", self.get_all_users, methods=["GET"], response_model=list[UserResponseAdminDto])
        self.router.add_api_route("/admin/edit", self.admin_edit_user, methods=["PUT"], response_model=UserResponseAdminDto)
        self.router.add_api_route("/request-password-reset", self.request_password_reset, methods=["POST"])
        self.router.add_api_route("/reset-password", self.reset_password, methods=["POST"])
        self.router.add_api_route("/confirm-account", self.confirm_account, methods=["GET"])
        self.router.add_api_route("/public-key", self.update_public_key, methods=["PUT"], response_model=dict)
        self.router.add_api_route("/public-key/{user_id}", self.get_public_key, methods=["GET"], response_model=dict)

    @requires_no_auth
    async def register(self, request: Request, username: str = Form(...), email: EmailStr = Form(...), password: str = Form(...), file: Optional[UploadFile] = None):
        user_data = UserCreate(username=username, email=email, password=password)
        image_bytes = await file.read() if file else None
        try:
            user = await self.user_service.register_user(user_data, image_bytes)
            # The register_user now handles image upload and setting active_avatar_url
            return UserResponseDto.model_validate(user.__dict__)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_no_auth
    async def login(self, user_login: UserLogin, request: Request):
        try:
            token_data = await self.user_service.login_user(user_login)
            return token_data
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    @requires_auth
    async def upload_profile_image(self, request: Request, file: UploadFile = File(...)) -> UserImageResponseDto:
        user_id = request.state.user.sub
        image_bytes = await file.read()
        try:
            user_image = await self.user_service.upload_profile_picture(user_id, image_bytes)
            return user_image
        except ImageSecurityError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_my_profile_images(self, request: Request) -> list[UserImageResponseDto]:
        user_id = request.state.user.sub
        try:
            images = await self.user_service.get_user_images(user_id)
            return images
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_profile_image_data(self, request: Request, image_id: UUID) -> Response:
        user_id = request.state.user.sub
        try:
            # Verify image belongs to user
            images = await self.user_service.get_user_images(user_id)
            image_key = next((img.image_key for img in images if img.id == image_id), None)
            if not image_key:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found or does not belong to user.")

            image_data = await self.user_service.get_image_data(image_key)
            return Response(content=image_data, media_type="image/jpeg")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def delete_profile_image(self, request: Request, image_id: UUID) -> dict:
        user_id = request.state.user.sub
        try:
            await self.user_service.delete_user_image(user_id, image_id)
            return {"detail": "Image deleted successfully."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def set_active_profile_image(self, request: Request, image_id: UUID) -> UserImageResponseDto:
        user_id = request.state.user.sub
        try:
            user_image = await self.user_service.set_active_profile_picture(user_id, image_id)
            return user_image
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_admin
    async def admin_get_user_profile_images(self, request: Request, user_id: UUID) -> list[UserImageResponseDto]:
        try:
            images = await self.user_service.get_user_images(str(user_id))
            return images
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_admin
    async def admin_get_user_profile_image_data(self, request: Request, user_id: UUID, image_id: UUID) -> Response:
        try:
            # Verify image belongs to user
            images = await self.user_service.get_user_images(str(user_id))
            image_key = next((img.image_key for img in images if img.id == image_id), None)
            if not image_key:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found or does not belong to user.")

            image_data = await self.user_service.get_image_data(image_key)
            return Response(content=image_data, media_type="image/jpeg")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def delete_user(self, request: Request) -> dict:
        user_id = request.state.user.sub
        try:
            await self.user_service.delete_user_account(user_id)
            return {"detail": "User deleted"}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_admin
    async def admin_delete_user(self, request: Request, user_id: str) -> dict:
        try:
            await self.user_service.delete_user_account(user_id)
            return {"detail": "User deleted by admin"}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_me(self, request: Request) -> UserResponseDto:
        user_id = request.state.user.sub
        try:
            user = await self.user_service.get_me(user_id)
            return UserResponseDto.model_validate(user.__dict__)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    @requires_admin
    async def get_all_users(self, request: Request) -> list[UserResponseAdminDto]:
        users = await self.user_service.get_all_users()
        return [UserResponseAdminDto.model_validate(u.__dict__) for u in users]

    @requires_admin
    async def admin_edit_user(self, request: Request, user_id: str, role: Optional[UserRole] = Form(None), account_confirmed: Optional[bool] = Form(None), file: UploadFile = File(None)) -> UserResponseAdminDto:
        # Handle empty string for optional form fields
        if role == "":
            role = None
        if account_confirmed == "":
            account_confirmed = None

        user_data = UserAdminEdit(role=role, account_confirmed=account_confirmed)
        try:
            user = await self.user_service.admin_edit_user(user_id, user_data, await file.read() if file else None)
            return UserResponseAdminDto.model_validate(user.__dict__)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    @requires_no_auth
    async def request_password_reset(self, email: str):
        try:
            await self.user_service.request_password_reset(email)
            return {"detail": "Password reset email sent if user exists."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_no_auth
    async def reset_password(self, token: str, new_password: str, confirm_password: str):
        try:
            await self.user_service.reset_password(token, new_password, confirm_password)
            return {"detail": "Password has been reset successfully."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    async def confirm_account(self, token: str):
        try:
            await self.user_service.confirm_account(token)
            return {"detail": "Account confirmed successfully."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def update_public_key(self, request: Request, public_key_data: UserUpdatePublicKey) -> dict:
        user_id = request.state.user.sub
        try:
            await self.user_service.update_public_key(user_id, public_key_data.public_key)
            return {"detail": "Public key updated successfully."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    @requires_auth
    async def get_public_key(self, request: Request, user_id: str) -> dict:
        try:
            public_key = await self.user_service.get_public_key(user_id)
            if not public_key:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Public key not found for this user.")
            return {"public_key": public_key}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))