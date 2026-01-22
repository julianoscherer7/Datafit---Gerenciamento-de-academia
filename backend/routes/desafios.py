from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Desafio, UsuarioDesafio
from schemas import DesafioResponse, UsuarioDesafioResponse
from security import get_current_user
from utils import atualizar_progresso_desafio
from datetime import date

router = APIRouter(prefix="/desafios", tags=["desafios"])

@router.get("", response_model=List[DesafioResponse])
def listar_desafios(
    db: Session = Depends(get_db)
):
    """Lista todos os desafios disponíveis"""
    desafios = db.query(Desafio).filter(Desafio.ativo == True).all()
    return desafios

@router.get("/usuario/{usuario_id}", response_model=List[dict])
def listar_desafios_usuario(
    usuario_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista desafios do usuário"""
    # Apenas o próprio usuário ou instrutor
    if current_user["user_id"] != usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão"
        )
    
    desafios = db.query(UsuarioDesafio, Desafio).join(
        Desafio, Desafio.id == UsuarioDesafio.desafio_id
    ).filter(UsuarioDesafio.usuario_id == usuario_id).all()
    
    return [
        {
            "id": ud.UsuarioDesafio.id,
            "desafio_id": ud.Desafio.id,
            "titulo": ud.Desafio.titulo,
            "descricao": ud.Desafio.descricao,
            "tipo": ud.Desafio.tipo,
            "alvo_valor": float(ud.Desafio.alvo_valor or 0),
            "progresso": float(ud.UsuarioDesafio.progresso or 0),
            "concluido": ud.UsuarioDesafio.concluido,
            "data_inicio": ud.UsuarioDesafio.data_inicio.isoformat(),
            "data_conclusao": ud.UsuarioDesafio.data_conclusao.isoformat() if ud.UsuarioDesafio.data_conclusao else None
        }
        for ud in desafios
    ]

@router.post("/participar/{desafio_id}", response_model=UsuarioDesafioResponse)
def participar_desafio(
    desafio_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Usuário participa de um desafio"""
    desafio = db.query(Desafio).filter(Desafio.id == desafio_id).first()
    
    if not desafio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Desafio não encontrado"
        )
    
    # Verifica se já participa
    ja_participa = db.query(UsuarioDesafio).filter(
        UsuarioDesafio.usuario_id == current_user["user_id"],
        UsuarioDesafio.desafio_id == desafio_id
    ).first()
    
    if ja_participa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já participa deste desafio"
        )
    
    usuario_desafio = UsuarioDesafio(
        usuario_id=current_user["user_id"],
        desafio_id=desafio_id,
        data_inicio=date.today()
    )
    db.add(usuario_desafio)
    db.commit()
    db.refresh(usuario_desafio)
    
    return usuario_desafio

@router.post("/progresso/{usuario_desafio_id}")
def atualizar_progresso(
    usuario_desafio_id: int,
    valor_adicionado: float,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza progresso de um desafio"""
    usuario_desafio = db.query(UsuarioDesafio).filter(
        UsuarioDesafio.id == usuario_desafio_id
    ).first()
    
    if not usuario_desafio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Desafio do usuário não encontrado"
        )
    
    # Verifica permissão
    if current_user["user_id"] != usuario_desafio.usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão"
        )
    
    # Atualiza progresso
    atualizar_progresso_desafio(
        db, 
        usuario_desafio.usuario_id,
        usuario_desafio.desafio_id,
        valor_adicionado
    )
    
    db.refresh(usuario_desafio)
    
    return {
        "id": usuario_desafio.id,
        "progresso": float(usuario_desafio.progresso or 0),
        "concluido": usuario_desafio.concluido
    }
