from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Story, StoryView, Amizade, Usuario
from security import get_current_user

router = APIRouter(prefix="/stories", tags=["stories"])

# Schemas
class StoryCreate(BaseModel):
    tipo: str = "foto"  # foto, treino, conquista
    conteudo_base64: Optional[str] = None
    texto: Optional[str] = None

class StoryResponse(BaseModel):
    id: int
    usuario_id: int
    usuario_nome: Optional[str] = None
    usuario_foto: Optional[str] = None
    tipo: str
    conteudo_base64: Optional[str]
    texto: Optional[str]
    emoji_reacoes: dict
    visualizacoes: int
    criado_em: datetime
    expira_em: datetime
    visualizado: bool = False
    
    class Config:
        from_attributes = True

class StoryReaction(BaseModel):
    emoji: str

# Rotas
@router.post("/criar", response_model=StoryResponse)
async def criar_story(
    story_data: StoryCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria um novo story (expira em 24h)"""
    
    # Calcular expiração (24h)
    expira_em = datetime.now() + timedelta(hours=24)
    
    novo_story = Story(
        usuario_id=current_user["user_id"],
        tipo=story_data.tipo,
        conteudo_base64=story_data.conteudo_base64,
        texto=story_data.texto,
        emoji_reacoes={},
        visualizacoes=0,
        ativo=True,
        expira_em=expira_em
    )
    
    db.add(novo_story)
    db.commit()
    db.refresh(novo_story)
    
    return StoryResponse(
        id=novo_story.id,
        usuario_id=novo_story.usuario_id,
        usuario_nome=current_user.get("nome"),
        tipo=novo_story.tipo,
        conteudo_base64=novo_story.conteudo_base64,
        texto=novo_story.texto,
        emoji_reacoes=novo_story.emoji_reacoes or {},
        visualizacoes=novo_story.visualizacoes,
        criado_em=novo_story.criado_em,
        expira_em=novo_story.expira_em,
        visualizado=False
    )

@router.get("/feed", response_model=List[dict])
async def get_feed_stories(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna stories dos amigos (últimas 24h)"""
    
    agora = datetime.now()
    limite_24h = agora - timedelta(hours=24)
    
    # Buscar IDs dos amigos
    amigos_ids = db.query(Amizade.solicitado_id).filter(
        Amizade.solicitante_id == current_user["user_id"],
        Amizade.status == "aceito"
    ).union(
        db.query(Amizade.solicitante_id).filter(
            Amizade.solicitado_id == current_user["user_id"],
            Amizade.status == "aceito"
        )
    ).all()
    
    amigos_ids = [a[0] for a in amigos_ids]
    amigos_ids.append(current_user["user_id"])  # Incluir próprios stories
    
    # Buscar stories ativos
    stories = db.query(Story, Usuario).join(
        Usuario, Story.usuario_id == Usuario.id
    ).filter(
        Story.usuario_id.in_(amigos_ids),
        Story.ativo == True,
        Story.criado_em >= limite_24h
    ).order_by(Story.criado_em.desc()).all()
    
    # Verificar quais foram visualizados
    visualizados = db.query(StoryView.story_id).filter(
        StoryView.usuario_id == current_user["user_id"]
    ).all()
    visualizados_ids = set([v[0] for v in visualizados])
    
    # Agrupar por usuário
    usuarios_stories = {}
    for story, usuario in stories:
        if usuario.id not in usuarios_stories:
            usuarios_stories[usuario.id] = {
                "usuario_id": usuario.id,
                "usuario_nome": usuario.nome,
                "usuario_foto": "👤",  # Placeholder
                "stories": [],
                "tem_nao_visto": False
            }
        
        story_data = {
            "id": story.id,
            "tipo": story.tipo,
            "conteudo_base64": story.conteudo_base64,
            "texto": story.texto,
            "emoji_reacoes": story.emoji_reacoes or {},
            "visualizacoes": story.visualizacoes,
            "criado_em": story.criado_em.isoformat(),
            "visualizado": story.id in visualizados_ids
        }
        
        if not story_data["visualizado"]:
            usuarios_stories[usuario.id]["tem_nao_visto"] = True
        
        usuarios_stories[usuario.id]["stories"].append(story_data)
    
    return list(usuarios_stories.values())

@router.get("/meus", response_model=List[StoryResponse])
async def get_meus_stories(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna stories do usuário atual"""
    
    limite_24h = datetime.now() - timedelta(hours=24)
    
    stories = db.query(Story).filter(
        Story.usuario_id == current_user["user_id"],
        Story.ativo == True,
        Story.criado_em >= limite_24h
    ).order_by(Story.criado_em.desc()).all()
    
    return [
        StoryResponse(
            id=s.id,
            usuario_id=s.usuario_id,
            tipo=s.tipo,
            conteudo_base64=s.conteudo_base64,
            texto=s.texto,
            emoji_reacoes=s.emoji_reacoes or {},
            visualizacoes=s.visualizacoes,
            criado_em=s.criado_em,
            expira_em=s.expira_em,
            visualizado=True
        ) for s in stories
    ]

@router.post("/visualizar/{story_id}")
async def visualizar_story(
    story_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra visualização de um story"""
    
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    # Verificar se já visualizou
    view_existente = db.query(StoryView).filter(
        StoryView.story_id == story_id,
        StoryView.usuario_id == current_user["user_id"]
    ).first()
    
    if not view_existente:
        nova_view = StoryView(
            story_id=story_id,
            usuario_id=current_user["user_id"]
        )
        db.add(nova_view)
        
        # Incrementar contador
        story.visualizacoes += 1
        db.commit()
    
    return {"success": True, "visualizacoes": story.visualizacoes}

@router.post("/reagir/{story_id}")
async def reagir_story(
    story_id: int,
    reaction: StoryReaction,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adiciona reação emoji a um story"""
    
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    # Atualizar reações
    reacoes = story.emoji_reacoes or {}
    emoji = reaction.emoji
    
    if emoji in reacoes:
        reacoes[emoji] += 1
    else:
        reacoes[emoji] = 1
    
    story.emoji_reacoes = reacoes
    db.commit()
    
    return {"success": True, "reacoes": reacoes}

@router.delete("/{story_id}")
async def deletar_story(
    story_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta um story do usuário"""
    
    story = db.query(Story).filter(
        Story.id == story_id,
        Story.usuario_id == current_user["user_id"]
    ).first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    story.ativo = False
    db.commit()
    
    return {"success": True}
