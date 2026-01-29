from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configurar logging
logger = logging.getLogger(__name__)

# Usar chave padrão se não configurada (apenas para dev)
SECRET_KEY = os.getenv("SECRET_KEY", "fitdata-dev-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 horas

if SECRET_KEY == "fitdata-dev-secret-key-change-in-production":
    logger.warning("[SECURITY] Usando SECRET_KEY padrão! Configure em .env para produção.")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash de senha usando bcrypt"""
    hashed = pwd_context.hash(password)
    logger.debug(f"[SECURITY] Password hashed successfully")
    return hashed

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha"""
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.debug(f"[SECURITY] Password verification: {result}")
        return result
    except Exception as e:
        logger.error(f"[SECURITY] Erro na verificação de senha: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"[SECURITY] Token criado para sub={data.get('sub')}")
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decodifica JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"[SECURITY] Token inválido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials = Depends(security)) -> dict:
    """Dependency para obter usuário atual do token"""
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            logger.warning("[SECURITY] Token sem 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        return {"user_id": int(user_id), "perfil": payload.get("perfil")}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[SECURITY] Erro ao processar token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )


