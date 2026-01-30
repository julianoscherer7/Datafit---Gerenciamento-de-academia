from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Checkin, Treino, SerieExecutada, UsuarioProgresso, Recompensa, Usuario
from security import get_current_user

router = APIRouter(prefix="/checkin", tags=["checkin"])

# Schemas
class CheckinCreate(BaseModel):
    treino_id: Optional[int] = None
    foto_base64: Optional[str] = None
    localizacao: Optional[str] = None

class CheckinResponse(BaseModel):
    id: int
    usuario_id: int
    treino_id: Optional[int]
    foto_base64: Optional[str]
    validado: bool
    pontos_ganhos: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

class CheckinValidation(BaseModel):
    checkin_id: int
    treino_id: int
    tem_exercicios: bool
    validado: bool
    badge_desbloqueado: Optional[str] = None

# Rotas
@router.post("/iniciar", response_model=CheckinResponse)
async def iniciar_checkin(
    checkin_data: CheckinCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inicia um check-in de treino com foto"""
    
    # Verificar se já tem check-in hoje sem treino concluído
    hoje = datetime.now().date()
    checkin_existente = db.query(Checkin).filter(
        Checkin.usuario_id == current_user["user_id"],
        func.date(Checkin.criado_em) == hoje,
        Checkin.validado == False
    ).first()
    
    if checkin_existente:
        # Atualizar o check-in existente
        if checkin_data.foto_base64:
            checkin_existente.foto_base64 = checkin_data.foto_base64
        if checkin_data.treino_id:
            checkin_existente.treino_id = checkin_data.treino_id
        if checkin_data.localizacao:
            checkin_existente.localizacao = checkin_data.localizacao
        db.commit()
        db.refresh(checkin_existente)
        return checkin_existente
    
    # Criar novo check-in
    novo_checkin = Checkin(
        usuario_id=current_user["user_id"],
        treino_id=checkin_data.treino_id,
        foto_base64=checkin_data.foto_base64,
        localizacao=checkin_data.localizacao,
        validado=False,
        pontos_ganhos=10  # Pontos base por check-in
    )
    
    db.add(novo_checkin)
    db.commit()
    db.refresh(novo_checkin)
    
    # Adicionar pontos por check-in
    _adicionar_recompensa(db, current_user["user_id"], "checkin")
    
    return novo_checkin

@router.post("/validar/{checkin_id}", response_model=CheckinValidation)
async def validar_treino(
    checkin_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Valida um treino - requer check-in + pelo menos 1 exercício"""
    
    checkin = db.query(Checkin).filter(
        Checkin.id == checkin_id,
        Checkin.usuario_id == current_user["user_id"]
    ).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in não encontrado")
    
    if checkin.validado:
        return CheckinValidation(
            checkin_id=checkin.id,
            treino_id=checkin.treino_id,
            tem_exercicios=True,
            validado=True,
            badge_desbloqueado=None
        )
    
    # Verificar se tem exercícios registrados hoje
    hoje = datetime.now().date()
    exercicios_hoje = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == current_user["user_id"],
        func.date(SerieExecutada.data_execucao) == hoje
    ).count()
    
    tem_exercicios = exercicios_hoje > 0
    
    # Validar se tem check-in E exercícios
    if checkin.foto_base64 and tem_exercicios:
        checkin.validado = True
        checkin.pontos_ganhos = 50  # Pontos por treino validado
        db.commit()
        
        # Adicionar recompensa por treino validado
        badge = _adicionar_recompensa(db, current_user["user_id"], "treino_validado")
        
        # Atualizar contador de treinos validados
        progresso = _get_or_create_progresso(db, current_user["user_id"])
        progresso.treinos_validados += 1
        db.commit()
        
        return CheckinValidation(
            checkin_id=checkin.id,
            treino_id=checkin.treino_id,
            tem_exercicios=True,
            validado=True,
            badge_desbloqueado=badge
        )
    
    return CheckinValidation(
        checkin_id=checkin.id,
        treino_id=checkin.treino_id,
        tem_exercicios=tem_exercicios,
        validado=False,
        badge_desbloqueado=None
    )

@router.get("/hoje", response_model=Optional[CheckinResponse])
async def get_checkin_hoje(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o check-in de hoje do usuário"""
    hoje = datetime.now().date()
    checkin = db.query(Checkin).filter(
        Checkin.usuario_id == current_user["user_id"],
        func.date(Checkin.criado_em) == hoje
    ).first()
    
    return checkin

@router.get("/historico", response_model=List[CheckinResponse])
async def get_historico_checkins(
    limite: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna histórico de check-ins do usuário"""
    checkins = db.query(Checkin).filter(
        Checkin.usuario_id == current_user["user_id"]
    ).order_by(Checkin.criado_em.desc()).limit(limite).all()
    
    return checkins

@router.get("/status")
async def get_status_treino(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna status completo do treino de hoje"""
    hoje = datetime.now().date()
    
    # Check-in de hoje
    checkin = db.query(Checkin).filter(
        Checkin.usuario_id == current_user["user_id"],
        func.date(Checkin.criado_em) == hoje
    ).first()
    
    # Exercícios de hoje
    exercicios_hoje = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == current_user["user_id"],
        func.date(SerieExecutada.data_execucao) == hoje
    ).count()
    
    # Progresso do usuário
    progresso = _get_or_create_progresso(db, current_user["user_id"])
    
    return {
        "tem_checkin": checkin is not None,
        "checkin_validado": checkin.validado if checkin else False,
        "foto_enviada": bool(checkin.foto_base64) if checkin else False,
        "exercicios_registrados": exercicios_hoje,
        "pode_validar": checkin is not None and bool(checkin.foto_base64) and exercicios_hoje > 0,
        "moedas": progresso.moedas,
        "xp": progresso.xp_total,
        "nivel": progresso.nivel,
        "treinos_validados": progresso.treinos_validados
    }

# Funções auxiliares
def _get_or_create_progresso(db: Session, usuario_id: int) -> UsuarioProgresso:
    progresso = db.query(UsuarioProgresso).filter(
        UsuarioProgresso.usuario_id == usuario_id
    ).first()
    
    if not progresso:
        progresso = UsuarioProgresso(usuario_id=usuario_id)
        db.add(progresso)
        db.commit()
        db.refresh(progresso)
    
    return progresso

def _adicionar_recompensa(db: Session, usuario_id: int, acao: str) -> Optional[str]:
    """Adiciona recompensa por ação e retorna badge se desbloqueado"""
    
    # Buscar recompensa configurada
    recompensa = db.query(Recompensa).filter(
        Recompensa.acao == acao,
        Recompensa.ativo == True
    ).first()
    
    moedas = recompensa.moedas if recompensa else 10
    xp = recompensa.xp if recompensa else 5
    
    # Atualizar progresso do usuário
    progresso = _get_or_create_progresso(db, usuario_id)
    progresso.moedas += moedas
    progresso.xp_total += xp
    
    # Calcular nível (cada 100 XP = 1 nível)
    novo_nivel = (progresso.xp_total // 100) + 1
    badge_desbloqueado = None
    
    if novo_nivel > progresso.nivel:
        progresso.nivel = novo_nivel
        badge_desbloqueado = f"Nível {novo_nivel}"
    
    db.commit()
    
    return badge_desbloqueado
