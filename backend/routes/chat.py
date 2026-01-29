from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Mensagem, Amizade, Usuario
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
    amigo_foto: str
    ultima_mensagem: Optional[str]
    ultima_data: Optional[datetime]
    nao_lidas: int

# Rotas
@router.post("/enviar", response_model=MensagemResponse)
async def enviar_mensagem(
    msg_data: MensagemCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envia uma mensagem para um amigo"""
    user_id = current_user["user_id"]
    
    # Verificar se são amigos
    amizade = db.query(Amizade).filter(
        or_(
            and_(
                Amizade.solicitante_id == user_id,
                Amizade.solicitado_id == msg_data.destinatario_id
            ),
            and_(
                Amizade.solicitante_id == msg_data.destinatario_id,
                Amizade.solicitado_id == user_id
            )
        ),
        Amizade.status == "aceito"
    ).first()
    
    if not amizade:
        raise HTTPException(
            status_code=403, 
            detail="Vocês precisam ser amigos para trocar mensagens"
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
    """Lista todas as conversas do usuário"""
    user_id = current_user["user_id"]
    
    # Buscar amigos aceitos
    amigos = db.query(Usuario).join(
        Amizade,
        or_(
            and_(
                Amizade.solicitante_id == user_id,
                Amizade.solicitado_id == Usuario.id
            ),
            and_(
                Amizade.solicitado_id == user_id,
                Amizade.solicitante_id == Usuario.id
            )
        )
    ).filter(Amizade.status == "aceito").all()
    
    conversas = []
    for amigo in amigos:
        # Última mensagem
        ultima_msg = db.query(Mensagem).filter(
            or_(
                and_(
                    Mensagem.remetente_id == user_id,
                    Mensagem.destinatario_id == amigo.id
                ),
                and_(
                    Mensagem.remetente_id == amigo.id,
                    Mensagem.destinatario_id == user_id
                )
            )
        ).order_by(Mensagem.criado_em.desc()).first()
        
        # Contar não lidas
        nao_lidas = db.query(Mensagem).filter(
            Mensagem.remetente_id == amigo.id,
            Mensagem.destinatario_id == user_id,
            Mensagem.lida == False
        ).count()
        
        conversas.append(ConversaResponse(
            amigo_id=amigo.id,
            amigo_nome=amigo.nome,
            amigo_foto="👤",
            ultima_mensagem=ultima_msg.conteudo if ultima_msg else None,
            ultima_data=ultima_msg.criado_em if ultima_msg else None,
            nao_lidas=nao_lidas
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
    """Retorna histórico de mensagens com um amigo"""
    user_id = current_user["user_id"]
    
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
    
    return {"nao_lidas": total}
