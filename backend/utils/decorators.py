from fastapi import Request, HTTPException, status
from functools import wraps
from utils.jwt import verify_token, decode_jwt
from dto.user import UserRole

# Decorator for endpoints that require admin privileges
def requires_admin(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        if not request:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request object not found")
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
        token = auth_header.split("Bearer ", 1)[1]
        try:
            payload = await decode_jwt(token)
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        # Check user role
        if payload.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        request.state.user = payload
        return await func(*args, **kwargs)
    return wrapper

# Decorator for endpoints that require authentication
def requires_auth(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        if not request:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request object not found")
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
        token = auth_header.split("Bearer ", 1)[1]
        user_sub = await verify_token(token)
        if not user_sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        try:
            payload = await decode_jwt(token)
            request.state.user = payload  # Optionally attach user info to request
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        return await func(*args, **kwargs)
    return wrapper

# Decorator for endpoints that require no authentication (e.g., login/register)
def requires_no_auth(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        if not request:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request object not found")
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split("Bearer ", 1)[-1]
            if verify_token(token):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already authenticated")
        return await func(*args, **kwargs)
    return wrapper
