from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario
from schemas import UsuarioResponse
from security import get_current_user, hash_password, verify_password
from pydantic import BaseModel

router = APIRouter(prefix="/configs", tags=["configs"])

class ConfigUpdate(BaseModel):
    nome: str = None
    senha_atual: str = None
    senha_nova: str = None

@router.get("", response_model=UsuarioResponse)
def obter_configs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém configurações do usuário autenticado"""
    usuario = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return usuario

@router.put("", response_model=UsuarioResponse)
def atualizar_configs(
    config: ConfigUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza configurações do usuário"""
    usuario = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualiza nome
    if config.nome:
        usuario.nome = config.nome
    
    # Atualiza senha
    if config.senha_nova and config.senha_atual:
        # Verifica senha atual
        if not verify_password(config.senha_atual, usuario.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha atual incorreta"
            )
        
        usuario.senha_hash = hash_password(config.senha_nova)
    elif config.senha_nova and not config.senha_atual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual necessária para alterar senha"
        )
    
    db.commit()
    db.refresh(usuario)
    
    return usuario
