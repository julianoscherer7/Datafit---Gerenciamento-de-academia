from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Amizade, Usuario
from schemas import AmizadeCreate, AmizadeResponse
from security import get_current_user
from sqlalchemy import or_

router = APIRouter(prefix="/amigos", tags=["amigos"])

@router.get("", response_model=List[dict])
def listar_amigos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista amigos aceitos do usuário"""
    amigos = db.query(Amizade).filter(
        Amizade.status == "aceito",
        or_(
            Amizade.solicitante_id == current_user["user_id"],
            Amizade.solicitado_id == current_user["user_id"]
        )
    ).all()
    
    resultado = []
    for amizade in amigos:
        amigo_id = amizade.solicitado_id if amizade.solicitante_id == current_user["user_id"] else amizade.solicitante_id
        usuario = db.query(Usuario).filter(Usuario.id == amigo_id).first()
        if usuario:
            resultado.append({
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "perfil": usuario.perfil
            })
    
    return resultado

@router.get("/pendentes", response_model=List[AmizadeResponse])
def listar_solicitacoes_pendentes(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista solicitações de amizade pendentes recebidas"""
    solicitacoes = db.query(Amizade).filter(
        Amizade.solicitado_id == current_user["user_id"],
        Amizade.status == "pendente"
    ).all()
    
    return solicitacoes

@router.post("/solicitar", response_model=AmizadeResponse)
def solicitar_amizade(
    solicitacao: AmizadeCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Solicita amizade a outro usuário"""
    # Verifica se usuário existe
    usuario_alvo = db.query(Usuario).filter(Usuario.id == solicitacao.solicitado_id).first()
    if not usuario_alvo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Não pode solicitar amizade a si mesmo
    if solicitacao.solicitado_id == current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não pode solicitar amizade a si mesmo"
        )
    
    # Verifica se já existe relação
    ja_existe = db.query(Amizade).filter(
        or_(
            (Amizade.solicitante_id == current_user["user_id"] and Amizade.solicitado_id == solicitacao.solicitado_id),
            (Amizade.solicitante_id == solicitacao.solicitado_id and Amizade.solicitado_id == current_user["user_id"])
        )
    ).first()
    
    if ja_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relação de amizade já existe"
        )
    
    amizade = Amizade(
        solicitante_id=current_user["user_id"],
        solicitado_id=solicitacao.solicitado_id,
        status="pendente"
    )
    db.add(amizade)
    db.commit()
    db.refresh(amizade)
    
    return amizade

@router.post("/aceitar/{amizade_id}", response_model=AmizadeResponse)
def aceitar_amizade(
    amizade_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aceita solicitação de amizade"""
    amizade = db.query(Amizade).filter(Amizade.id == amizade_id).first()
    
    if not amizade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitação não encontrada"
        )
    
    # Verifica se é o destinatário
    if amizade.solicitado_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para aceitar esta solicitação"
        )
    
    amizade.status = "aceito"
    db.commit()
    db.refresh(amizade)
    
    return amizade

@router.post("/rejeitar/{amizade_id}", response_model=AmizadeResponse)
def rejeitar_amizade(
    amizade_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rejeita solicitação de amizade"""
    amizade = db.query(Amizade).filter(Amizade.id == amizade_id).first()
    
    if not amizade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitação não encontrada"
        )
    
    if amizade.solicitado_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão"
        )
    
    amizade.status = "rejeitado"
    db.commit()
    db.refresh(amizade)
    
    return amizade

@router.get("/feed", response_model=List[dict])
def obter_feed_amigos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém atividades dos amigos"""
    from models import SerieExecutada
    from datetime import timedelta
    from datetime import date as dt
    
    # Obtém IDs dos amigos
    amigos_rel = db.query(Amizade).filter(
        Amizade.status == "aceito",
        or_(
            Amizade.solicitante_id == current_user["user_id"],
            Amizade.solicitado_id == current_user["user_id"]
        )
    ).all()
    
    amigos_ids = []
    for a in amigos_rel:
        if a.solicitante_id == current_user["user_id"]:
            amigos_ids.append(a.solicitado_id)
        else:
            amigos_ids.append(a.solicitante_id)
    
    if not amigos_ids:
        return []
    
    # Obtém atividades dos últimos 7 dias
    data_inicio = dt.today() - timedelta(days=7)
    atividades = db.query(SerieExecutada, Usuario).join(
        Usuario, Usuario.id == SerieExecutada.aluno_id
    ).filter(
        SerieExecutada.aluno_id.in_(amigos_ids),
        SerieExecutada.data_execucao >= data_inicio
    ).order_by(SerieExecutada.data_execucao.desc()).limit(20).all()
    
    return [
        {
            "usuario_id": at.Usuario.id,
            "usuario_nome": at.Usuario.nome,
            "atividade": f"Executou {at.SerieExecutada.repeticoes} reps de {at.SerieExecutada.carga_kg}kg",
            "data": at.SerieExecutada.data_execucao.isoformat()
        }
        for at in atividades
    ]
