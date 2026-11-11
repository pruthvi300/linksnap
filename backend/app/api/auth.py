from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db import database
from app.models.user import users
from app.schemas.user import UserCreate, UserOut, UserLogin, Token
from app.utils.security import hash_password, verify_password, create_access_token
import uuid
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get current authenticated user from JWT token
    """
    token = credentials.credentials
    
    # Decode token
    from app.utils.security import decode_access_token
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(query)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return dict(user)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """
    Register a new user
    """
    # Check if email already exists
    query = users.select().where(users.c.email == user.email)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)
    query = users.insert().values(
        id=user_id,
        name=user.name,
        email=user.email,
        password_hash=hashed_pw,
        role="user",
        created_at=datetime.utcnow()
    )
    await database.execute(query)
    
    return {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "role": "user"
    }

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    Login user and return JWT token
    """
    # Find user by email
    query = users.select().where(users.c.email == user_credentials.email)
    user = await database.fetch_one(query)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    """
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"]
    }

