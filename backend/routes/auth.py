from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import Usuario
from schemas import (
    UsuarioRegister, UsuarioLogin, TokenResponse, UsuarioResponse
)
from security import (
    hash_password, verify_password, create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(user: UsuarioRegister, db: Session = Depends(get_db)):
    """Registra novo usuário"""
    # Verifica se email já existe
    existing = db.query(Usuario).filter(Usuario.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Cria novo usuário
    db_user = Usuario(
        nome=user.nome,
        email=user.email,
        senha_hash=hash_password(user.senha),
        perfil=user.perfil
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Cria token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "perfil": db_user.perfil},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "perfil": db_user.perfil
    }

@router.post("/login", response_model=TokenResponse)
def login(user: UsuarioLogin, db: Session = Depends(get_db)):
    """Faz login do usuário"""
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    
    if not db_user or not verify_password(user.senha, db_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "perfil": db_user.perfil},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "perfil": db_user.perfil
    }

@router.get("/me", response_model=UsuarioResponse)
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém info do usuário autenticado"""
    user = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user
