from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TokenPayload(BaseModel):
    sub: UUID  # User ID
    role: str  # User role (e.g., 'admin', 'user')
    exp: Optional[int]  # Expiration timestamp

class TokenData(BaseModel):
    access_token: str

class ConfirmationTokenPayload(BaseModel):
    sub: Optional[UUID] = None
    email: str
    exp: Optional[int]
    type: str # To differentiate between account_confirmation and password_reset
