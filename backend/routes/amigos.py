from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Amizade, Usuario, UsuarioProgresso, Streak
from schemas import AmizadeCreate, AmizadeResponse
from security import get_current_user
from sqlalchemy import or_, and_, func

router = APIRouter(prefix="/amigos", tags=["amigos"])

@router.get("/ranking", response_model=List[dict])
def obter_ranking(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém ranking global de usuários por XP/nível"""
    results = db.query(
        Usuario, UsuarioProgresso, Streak
    ).outerjoin(
        UsuarioProgresso, UsuarioProgresso.usuario_id == Usuario.id
    ).outerjoin(
        Streak, Streak.usuario_id == Usuario.id
    ).filter(
        Usuario.perfil == "aluno"
    ).order_by(
        (UsuarioProgresso.xp_total).desc().nullslast()
    ).limit(50).all()
    
    return [
        {
            "id": u.id,
            "nome": u.nome,
            "nickname": u.nickname,
            "email": u.email,
            "perfil": u.perfil,
            "xp": p.xp_total if p else 0,
            "nivel": p.nivel if p else 1,
            "streak": s.atual if s else 0,
        }
        for u, p, s in results
    ]

@router.get("/buscar", response_model=List[dict])
def buscar_usuarios(
    q: str = "",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Busca usuários para adicionar como amigo"""
    if not q or len(q) < 2:
        return []
    
    usuarios = db.query(Usuario).filter(
        Usuario.id != current_user["user_id"],
        or_(
            Usuario.nome.ilike(f"%{q}%"),
            Usuario.email.ilike(f"%{q}%"),
            Usuario.nickname.ilike(f"%{q}%")
        )
    ).limit(20).all()
    
    # Get existing friendship IDs to mark status
    amizades = db.query(Amizade).filter(
        or_(
            Amizade.solicitante_id == current_user["user_id"],
            Amizade.solicitado_id == current_user["user_id"]
        )
    ).all()
    
    amizade_map = {}
    for a in amizades:
        other_id = a.solicitado_id if a.solicitante_id == current_user["user_id"] else a.solicitante_id
        amizade_map[other_id] = a.status
    
    return [
        {
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "nickname": u.nickname,
            "perfil": u.perfil,
            "amizade_status": amizade_map.get(u.id, None)
        }
        for u in usuarios
    ]

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
    
    # Verifica se já existe relação (use and_() not Python 'and')
    ja_existe = db.query(Amizade).filter(
        or_(
            and_(Amizade.solicitante_id == current_user["user_id"], Amizade.solicitado_id == solicitacao.solicitado_id),
            and_(Amizade.solicitante_id == solicitacao.solicitado_id, Amizade.solicitado_id == current_user["user_id"])
        )
    ).first()
    
    if ja_existe:
        if ja_existe.status == "rejeitado":
            # Allow re-sending if previously rejected
            ja_existe.status = "pendente"
            ja_existe.solicitante_id = current_user["user_id"]
            ja_existe.solicitado_id = solicitacao.solicitado_id
            db.commit()
            db.refresh(ja_existe)
            return ja_existe
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

@router.get("/sugestoes", response_model=List[dict])
def obter_sugestoes_amigos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém sugestões de amigos (usuários que não são amigos ainda)"""
    # Get existing friendships
    amizades = db.query(Amizade).filter(
        or_(
            Amizade.solicitante_id == current_user["user_id"],
            Amizade.solicitado_id == current_user["user_id"]
        )
    ).all()
    
    # IDs de usuários que já tem alguma relação
    exclude_ids = {current_user["user_id"]}
    for a in amizades:
        exclude_ids.add(a.solicitado_id)
        exclude_ids.add(a.solicitante_id)
    
    # Get random users who are not friends
    sugestoes = db.query(
        Usuario, UsuarioProgresso
    ).outerjoin(
        UsuarioProgresso, UsuarioProgresso.usuario_id == Usuario.id
    ).filter(
        Usuario.id.notin_(exclude_ids),
        Usuario.perfil == "aluno"
    ).order_by(
        func.random()
    ).limit(5).all()
    
    return [
        {
            "id": u.id,
            "nome": u.nome,
            "nickname": u.nickname,
            "email": u.email,
            "perfil": u.perfil,
            "xp": p.xp_total if p else 0,
            "nivel": p.nivel if p else 1,
        }
        for u, p in sugestoes
    ]

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

@router.get("/{amigo_id}/perfil", response_model=dict)
def obter_perfil_amigo(
    amigo_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém perfil público de um amigo/usuário"""
    from models import UsuarioBadge, Badge
    
    # Busca o usuário
    usuario = db.query(Usuario).filter(Usuario.id == amigo_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Busca progresso
    progresso = db.query(UsuarioProgresso).filter(
        UsuarioProgresso.usuario_id == amigo_id
    ).first()
    
    # Busca streak
    streak = db.query(Streak).filter(Streak.usuario_id == amigo_id).first()
    
    # Busca badges do usuário
    badges = db.query(Badge, UsuarioBadge).join(
        UsuarioBadge, UsuarioBadge.badge_id == Badge.id
    ).filter(UsuarioBadge.usuario_id == amigo_id).all()
    
    badges_list = [
        {
            "id": b.Badge.id,
            "codigo": b.Badge.codigo,
            "nome": b.Badge.nome,
            "descricao": b.Badge.descricao,
            "icone_url": b.Badge.icone_url,
            "obtido_em": b.UsuarioBadge.data_obtencao.isoformat() if b.UsuarioBadge.data_obtencao else None
        }
        for b in badges
    ]
    
    # Verifica status de amizade
    amizade_status = None
    amizade = db.query(Amizade).filter(
        or_(
            (Amizade.solicitante_id == current_user["user_id"]) & (Amizade.solicitado_id == amigo_id),
            (Amizade.solicitante_id == amigo_id) & (Amizade.solicitado_id == current_user["user_id"])
        )
    ).first()
    if amizade:
        amizade_status = amizade.status
    
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "nickname": usuario.nickname,
        "perfil": usuario.perfil,
        "foto_url": usuario.foto_url,
        "foto_base64": usuario.foto_base64,
        "banner_base64": usuario.banner_base64,
        "bio": usuario.bio,
        "instagram": usuario.instagram,
        "tiktok": usuario.tiktok,
        "twitter": usuario.twitter,
        "linkedin": usuario.linkedin,
        "xp": progresso.xp_total if progresso else 0,
        "nivel": progresso.nivel if progresso else 1,
        "titulo": progresso.titulo_atual if progresso else None,
        "streak": streak.atual if streak else 0,
        "max_streak": streak.maximo if streak else 0,
        "badges": badges_list,
        "amizade_status": amizade_status,
        "criado_em": usuario.criado_em.isoformat() if usuario.criado_em else None
    }
