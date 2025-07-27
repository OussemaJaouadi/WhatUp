from fastapi import Request, HTTPException, status, Depends
from functools import wraps
from utils.jwt import get_current_user
from dto.user import UserRole
from dto.token import TokenPayload

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
        
        current_user: TokenPayload = await get_current_user(request)
        
        # Check user role
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        
        request.state.user = current_user # Attach user info to request state
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
        
        current_user: TokenPayload = await get_current_user(request)
        request.state.user = current_user # Attach user info to request state
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
            try:
                # Attempt to get current user, if successful, it means they are already authenticated
                await get_current_user(request)
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already authenticated")
            except HTTPException as e:
                # If it's an authentication error, it means they are not authenticated, which is fine for no_auth
                if e.status_code == status.HTTP_401_UNAUTHORIZED:
                    pass
                else:
                    raise # Re-raise other HTTP exceptions
        return await func(*args, **kwargs)
    return wrapper

