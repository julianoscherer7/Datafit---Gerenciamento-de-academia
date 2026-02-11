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
    tipo: str = "texto"  # texto, imagem, treino, badge
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
    tipo: Optional[str] = None  # "amigo" or "coach" or "aluno"


def _are_connected(db: Session, user_id: int, other_id: int) -> bool:
    """Check if two users are friends OR have a coach-student connection"""
    # Check friendship
    amizade = db.query(Amizade).filter(
        or_(
            and_(Amizade.solicitante_id == user_id, Amizade.solicitado_id == other_id),
            and_(Amizade.solicitante_id == other_id, Amizade.solicitado_id == user_id)
        ),
        Amizade.status == "aceito"
    ).first()
    if amizade:
        return True
    
    # Check coach-student connection (either direction)
    coach_conn = db.query(CoachStudent).filter(
        or_(
            and_(CoachStudent.coach_id == user_id, CoachStudent.student_id == other_id),
            and_(CoachStudent.coach_id == other_id, CoachStudent.student_id == user_id)
        ),
        CoachStudent.status == "active"
    ).first()
    if coach_conn:
        return True
    
    return False


# Rotas
@router.post("/enviar", response_model=MensagemResponse)
async def enviar_mensagem(
    msg_data: MensagemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia uma mensagem para um amigo ou conexão coach/aluno"""
    user_id = current_user["user_id"]
    
    # Verificar se são amigos OU têm conexão coach-aluno
    if not _are_connected(db, user_id, msg_data.destinatario_id):
        raise HTTPException(
            status_code=403, 
            detail="Vocês precisam ser amigos ou ter conexão coach/aluno para trocar mensagens"
        )
    
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
    """Lista todas as conversas do usuário (amigos + conexões coach/aluno)"""
    user_id = current_user["user_id"]
    
    # Collect all connected user IDs with their relationship type
    connected_users = {}  # {user_id: tipo}
    
    # 1) Friends
    amigos = db.query(Usuario).join(
        Amizade,
        or_(
            and_(Amizade.solicitante_id == user_id, Amizade.solicitado_id == Usuario.id),
            and_(Amizade.solicitado_id == user_id, Amizade.solicitante_id == Usuario.id)
        )
    ).filter(Amizade.status == "aceito").all()
    
    for amigo in amigos:
        connected_users[amigo.id] = {"user": amigo, "tipo": "amigo"}
    
    # 2) Coach-student connections (coach sees students, student sees coach)
    # As coach: my students
    my_students = db.query(Usuario).join(
        CoachStudent, CoachStudent.student_id == Usuario.id
    ).filter(
        CoachStudent.coach_id == user_id,
        CoachStudent.status == "active"
    ).all()
    for student in my_students:
        if student.id not in connected_users:
            connected_users[student.id] = {"user": student, "tipo": "aluno"}
    
    # As student: my coach
    my_coaches = db.query(Usuario).join(
        CoachStudent, CoachStudent.coach_id == Usuario.id
    ).filter(
        CoachStudent.student_id == user_id,
        CoachStudent.status == "active"
    ).all()
    for coach in my_coaches:
        if coach.id not in connected_users:
            connected_users[coach.id] = {"user": coach, "tipo": "coach"}
    
    conversas = []
    for uid, info in connected_users.items():
        other_user = info["user"]
        tipo = info["tipo"]
        
        # Última mensagem
        ultima_msg = db.query(Mensagem).filter(
            or_(
                and_(Mensagem.remetente_id == user_id, Mensagem.destinatario_id == other_user.id),
                and_(Mensagem.remetente_id == other_user.id, Mensagem.destinatario_id == user_id)
            )
        ).order_by(Mensagem.criado_em.desc()).first()
        
        # Contar não lidas
        nao_lidas = db.query(Mensagem).filter(
            Mensagem.remetente_id == other_user.id,
            Mensagem.destinatario_id == user_id,
            Mensagem.lida == False
        ).count()
        
        # Build photo: use actual photo if available
        foto = other_user.foto_base64 or (other_user.foto_url if hasattr(other_user, 'foto_url') else None) or None
        
        conversas.append(ConversaResponse(
            amigo_id=other_user.id,
            amigo_nome=other_user.nome,
            amigo_foto=foto,
            ultima_mensagem=ultima_msg.conteudo if ultima_msg else None,
            ultima_data=ultima_msg.criado_em if ultima_msg else None,
            nao_lidas=nao_lidas,
            tipo=tipo
        ))
    
    # Ordenar por última mensagem
    conversas.sort(key=lambda x: x.ultima_data or datetime.min, reverse=True)
    
    return conversas

@router.get("/historico/{amigo_id}", response_model=List[MensagemResponse])
async def get_historico_chat(
    amigo_id: int,
    limite: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna histórico de mensagens com um amigo ou conexão coach/aluno"""
    user_id = current_user["user_id"]
    
    # Verify connection (friend or coach-student)
    if not _are_connected(db, user_id, amigo_id):
        raise HTTPException(status_code=403, detail="Sem conexão com este usuário")
    
    mensagens = db.query(Mensagem).filter(
        or_(
            and_(
                Mensagem.remetente_id == user_id,
                Mensagem.destinatario_id == amigo_id
            ),
            and_(
                Mensagem.remetente_id == amigo_id,
                Mensagem.destinatario_id == user_id
            )
        )
    ).order_by(Mensagem.criado_em.asc()).limit(limite).all()
    
    # Marcar como lidas as mensagens recebidas
    db.query(Mensagem).filter(
        Mensagem.remetente_id == amigo_id,
        Mensagem.destinatario_id == user_id,
        Mensagem.lida == False
    ).update({"lida": True})
    db.commit()
    
    return mensagens

@router.post("/marcar-lida/{mensagem_id}")
async def marcar_como_lida(
    mensagem_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marca uma mensagem como lida"""
    user_id = current_user["user_id"]
    
    mensagem = db.query(Mensagem).filter(
        Mensagem.id == mensagem_id,
        Mensagem.destinatario_id == user_id
    ).first()
    
    if mensagem:
        mensagem.lida = True
        db.commit()
    
    return {"success": True}

@router.get("/nao-lidas")
async def contar_nao_lidas(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Conta mensagens não lidas"""
    user_id = current_user["user_id"]
    count = db.query(Mensagem).filter(
        Mensagem.destinatario_id == user_id,
        Mensagem.lida == False
    ).count()
    return {"count": count}
