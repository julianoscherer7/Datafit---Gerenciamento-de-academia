from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Mensagem, Amizade, Usuario, CoachStudent
from security import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

# Schemas
class MensagemCreate(BaseModel):
    destinatario_id: int
    conteudo: str
    tipo: str = "texto"
    imagem_base64: Optional[str] = None

class MensagemResponse(BaseModel):
    id: int
    remetente_id: int
    destinatario_id: int
    conteudo: str
    tipo: str
    imagem_base64: Optional[str]
    lida: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True

class ConversaResponse(BaseModel):
    amigo_id: int
    amigo_nome: str
    amigo_foto: Optional[str]
    ultima_mensagem: Optional[str]
    ultima_data: Optional[datetime]
    nao_lidas: int
    tipo: Optional[str] = None


def _can_message(db: Session, user_id: int, other_id: int) -> bool:
    """Check if two users can exchange messages.
    Allowed if: friends, coach-student (any status), OR existing message history."""
    amizade = db.query(Amizade).filter(
        or_(
            and_(Amizade.solicitante_id == user_id, Amizade.solicitado_id == other_id),
            and_(Amizade.solicitante_id == other_id, Amizade.solicitado_id == user_id)
        ),
        Amizade.status == "aceito"
    ).first()
    if amizade:
        return True
    
    coach_conn = db.query(CoachStudent).filter(
        or_(
            and_(CoachStudent.coach_id == user_id, CoachStudent.student_id == other_id),
            and_(CoachStudent.coach_id == other_id, CoachStudent.student_id == user_id)
        )
    ).first()
    if coach_conn:
        return True
    
    existing_msg = db.query(Mensagem).filter(
        or_(
            and_(Mensagem.remetente_id == user_id, Mensagem.destinatario_id == other_id),
            and_(Mensagem.remetente_id == other_id, Mensagem.destinatario_id == user_id)
        )
    ).first()
    if existing_msg:
        return True
    
    return False


def _get_relationship_type(db: Session, user_id: int, other_id: int) -> str:
    """Determine relationship type between two users."""
    as_coach = db.query(CoachStudent).filter(
        CoachStudent.coach_id == user_id,
        CoachStudent.student_id == other_id
    ).first()
    if as_coach:
        return "aluno" if as_coach.status == "active" else "ex-aluno"
    
    as_student = db.query(CoachStudent).filter(
        CoachStudent.coach_id == other_id,
        CoachStudent.student_id == user_id
    ).first()
    if as_student:
        return "coach" if as_student.status == "active" else "ex-coach"
    
    amizade = db.query(Amizade).filter(
        or_(
            and_(Amizade.solicitante_id == user_id, Amizade.solicitado_id == other_id),
            and_(Amizade.solicitante_id == other_id, Amizade.solicitado_id == user_id)
        ),
        Amizade.status == "aceito"
    ).first()
    if amizade:
        return "amigo"
    
    return "contato"


@router.post("/enviar", response_model=MensagemResponse)
async def enviar_mensagem(
    msg_data: MensagemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia mensagem - allowed if friends, coach/student, or have history"""
    user_id = current_user["user_id"]
    
    if not _can_message(db, user_id, msg_data.destinatario_id):
        raise HTTPException(status_code=403, detail="Sem conexao para trocar mensagens")
    
    nova_mensagem = Mensagem(
        remetente_id=user_id,
        destinatario_id=msg_data.destinatario_id,
        conteudo=msg_data.conteudo,
        tipo=msg_data.tipo,
        imagem_base64=msg_data.imagem_base64,
        lida=False
    )
    db.add(nova_mensagem)
    db.commit()
    db.refresh(nova_mensagem)
    return nova_mensagem

@router.get("/conversas", response_model=List[ConversaResponse])
async def listar_conversas(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas as conversas - includes historical even after disconnect"""
    user_id = current_user["user_id"]
    
    # All users with message history
    sent_to = db.query(Mensagem.destinatario_id).filter(Mensagem.remetente_id == user_id).distinct().all()
    received_from = db.query(Mensagem.remetente_id).filter(Mensagem.destinatario_id == user_id).distinct().all()
    
    partner_ids = set()
    for (uid,) in sent_to:
        partner_ids.add(uid)
    for (uid,) in received_from:
        partner_ids.add(uid)
    
    # Also add currently connected users
    amigos = db.query(Amizade).filter(
        or_(Amizade.solicitante_id == user_id, Amizade.solicitado_id == user_id),
        Amizade.status == "aceito"
    ).all()
    for a in amigos:
        partner_ids.add(a.solicitado_id if a.solicitante_id == user_id else a.solicitante_id)
    
    for (sid,) in db.query(CoachStudent.student_id).filter(CoachStudent.coach_id == user_id, CoachStudent.status == "active").all():
        partner_ids.add(sid)
    for (cid,) in db.query(CoachStudent.coach_id).filter(CoachStudent.student_id == user_id, CoachStudent.status == "active").all():
        partner_ids.add(cid)
    
    conversas = []
    for uid in partner_ids:
        other_user = db.query(Usuario).filter(Usuario.id == uid).first()
        if not other_user:
            continue
        
        tipo = _get_relationship_type(db, user_id, uid)
        
        ultima_msg = db.query(Mensagem).filter(
            or_(
                and_(Mensagem.remetente_id == user_id, Mensagem.destinatario_id == uid),
                and_(Mensagem.remetente_id == uid, Mensagem.destinatario_id == user_id)
            )
        ).order_by(Mensagem.criado_em.desc()).first()
        
        nao_lidas = db.query(Mensagem).filter(
            Mensagem.remetente_id == uid,
            Mensagem.destinatario_id == user_id,
            Mensagem.lida == False
        ).count()
        
        foto = other_user.foto_base64 or getattr(other_user, 'foto_url', None)
        
        conversas.append(ConversaResponse(
            amigo_id=other_user.id,
            amigo_nome=other_user.nickname or other_user.nome,
            amigo_foto=foto,
            ultima_mensagem=ultima_msg.conteudo if ultima_msg else None,
            ultima_data=ultima_msg.criado_em if ultima_msg else None,
            nao_lidas=nao_lidas,
            tipo=tipo
        ))
    
    conversas.sort(key=lambda x: x.ultima_data or datetime.min, reverse=True)
    return conversas

@router.get("/historico/{amigo_id}", response_model=List[MensagemResponse])
async def get_historico_chat(
    amigo_id: int,
    limite: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna historico de mensagens - persists after disconnect"""
    user_id = current_user["user_id"]
    
    if not _can_message(db, user_id, amigo_id):
        raise HTTPException(status_code=403, detail="Sem permissao para ver mensagens")
    
    mensagens = db.query(Mensagem).filter(
        or_(
            and_(Mensagem.remetente_id == user_id, Mensagem.destinatario_id == amigo_id),
            and_(Mensagem.remetente_id == amigo_id, Mensagem.destinatario_id == user_id)
        )
    ).order_by(Mensagem.criado_em.asc()).limit(limite).all()
    
    db.query(Mensagem).filter(
        Mensagem.remetente_id == amigo_id,
        Mensagem.destinatario_id == user_id,
        Mensagem.lida == False
    ).update({"lida": True})
    db.commit()
    
    return mensagens

@router.delete("/mensagem/{mensagem_id}")
async def deletar_mensagem(
    mensagem_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta uma mensagem especifica (apenas remetente)"""
    msg = db.query(Mensagem).filter(
        Mensagem.id == mensagem_id,
        Mensagem.remetente_id == current_user["user_id"]
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensagem nao encontrada")
    db.delete(msg)
    db.commit()
    return {"success": True, "message": "Mensagem deletada"}

@router.delete("/conversa/{outro_id}")
async def deletar_conversa(
    outro_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta todas as mensagens de uma conversa"""
    user_id = current_user["user_id"]
    deleted = db.query(Mensagem).filter(
        or_(
            and_(Mensagem.remetente_id == user_id, Mensagem.destinatario_id == outro_id),
            and_(Mensagem.remetente_id == outro_id, Mensagem.destinatario_id == user_id)
        )
    ).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "deleted": deleted}

@router.post("/marcar-lida/{mensagem_id}")
async def marcar_como_lida(
    mensagem_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = db.query(Mensagem).filter(Mensagem.id == mensagem_id, Mensagem.destinatario_id == current_user["user_id"]).first()
    if msg:
        msg.lida = True
        db.commit()
    return {"success": True}

@router.get("/nao-lidas")
async def contar_nao_lidas(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Mensagem).filter(Mensagem.destinatario_id == current_user["user_id"], Mensagem.lida == False).count()
    return {"count": count}
