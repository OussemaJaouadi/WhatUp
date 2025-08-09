from fastapi import WebSocket, HTTPException, status
from jose import JWTError
from dto.token import TokenPayload
from datetime import datetime, timedelta, timezone
from typing import Union, Any
from uuid import UUID
from jose import jwt, JWTError
from dto.token import TokenPayload, TokenData
from core.config import settings

SECRET_KEY = settings.JWT_SECRET_KEY
CONFIRMATION_SECRET_KEY = settings.JWT_ACCOUNT_CONFIRMATION
ALGORITHM = "HS256"
 # from utils.jwt import verify_token  # Removed to fix circular import

async def get_current_user_ws(websocket: WebSocket) -> TokenPayload:
    try:
        token = websocket.query_params.get("token")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated: Missing token",
            )
        payload = await verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

async def generate_account_confirmation_token(
    user_id: Any,
    email: str,
    expires_delta: timedelta = None
) -> TokenData:
    """
    Generate a token for account confirmation (contains both email and UUID).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expiration_period_str = settings.JWT_ACCOUNT_CONFIRMATION_EXPIRATION
        if expiration_period_str.endswith('h'):
            hours = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(hours=hours)
        elif expiration_period_str.endswith('m'):
            minutes = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "type": "account_confirmation"
    }
    encoded_jwt = jwt.encode(to_encode, CONFIRMATION_SECRET_KEY, algorithm=ALGORITHM)
    return TokenData(access_token=encoded_jwt)

async def generate_password_reset_token(
    email: str,
    expires_delta: timedelta = None
) -> TokenData:
    """
    Generate a token for password reset (contains only email).
    """
    expiration_period_str = settings.JWT_PASSWORD_RESET_EXPIRATION
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        if expiration_period_str.endswith('h'):
            hours = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(hours=hours)
        elif expiration_period_str.endswith('m'):
            minutes = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {
        "email": email,
        "exp": expire,
        "type": "password_reset"
    }
    encoded_jwt = jwt.encode(to_encode, CONFIRMATION_SECRET_KEY, algorithm=ALGORITHM)
    return TokenData(access_token=encoded_jwt)

async def create_access_token(
    payload: TokenPayload,
    expires_delta: timedelta = None
) -> TokenData:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expiration_period_str = settings.JWT_EXPIRATION_PERIOD
        if expiration_period_str.endswith('h'):
            hours = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(hours=hours)
        elif expiration_period_str.endswith('m'):
            minutes = int(expiration_period_str[:-1])
            expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = payload.dict()
    to_encode["sub"] = str(payload.sub) # Convert UUID to string
    to_encode["exp"] = expire
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return TokenData(access_token=encoded_jwt)

async def verify_token(token: str) -> Union[TokenPayload, None]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        payload["sub"] = UUID(payload["sub"]) # Convert string back to UUID
        return TokenPayload(**payload)
    except JWTError:
        return None

from fastapi import Request, HTTPException, status

async def decode_jwt(token: str) -> TokenPayload:
    """
    Decodes a JWT and returns the payload as a TokenPayload. Raises JWTError if invalid.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return TokenPayload(**payload)

async def get_current_user(request: Request) -> TokenPayload:
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        scheme, credentials = token.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme. Use 'Bearer <token>'",
                headers={"WWW-Authenticate": "Bearer"},
            )
        payload = await verify_token(credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
