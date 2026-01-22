from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Badge, UsuarioBadge, Usuario
from schemas import BadgeResponse
from security import get_current_user

router = APIRouter(prefix="/badges", tags=["badges"])

@router.get("", response_model=List[BadgeResponse])
def listar_badges(
    db: Session = Depends(get_db)
):
    """Lista todas as badges disponíveis"""
    badges = db.query(Badge).all()
    return badges

@router.get("/usuario/{usuario_id}", response_model=List[dict])
def obter_badges_usuario(
    usuario_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém badges de um usuário específico"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    badges = db.query(UsuarioBadge, Badge).join(
        Badge, Badge.id == UsuarioBadge.badge_id
    ).filter(UsuarioBadge.usuario_id == usuario_id).all()
    
    return [
        {
            "id": b.Badge.id,
            "codigo": b.Badge.codigo,
            "nome": b.Badge.nome,
            "descricao": b.Badge.descricao,
            "icone_url": b.Badge.icone_url,
            "adquirido_em": b.UsuarioBadge.adquirido_em.isoformat()
        }
        for b in badges
    ]

@router.get("/meus", response_model=List[dict])
def obter_minhas_badges(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém badges do usuário autenticado"""
    return obter_badges_usuario(current_user["user_id"], current_user, db)
