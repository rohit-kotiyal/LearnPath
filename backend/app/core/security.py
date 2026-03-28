from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWSError
from datetime import datetime, timezone, timedelta
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from passlib.context import CryptContext
import secrets, string


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

def verify_hash_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid Token")
        
        return user_id
    
    except JWSError:
        raise HTTPException(status_code=401, detail="Invalid or Expire Token")
    

def generate_passkey(length: int = 10) -> str:
    characters = string.ascii_uppercase + string.digits
    passkey = ''.join(secrets.choice(characters) for _ in range(length))
    return passkey