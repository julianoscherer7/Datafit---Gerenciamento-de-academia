from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import (
    Usuario, Treino, TreinoAtribuido, TreinoExercicio, Exercicio,
    SerieExecutada, Desafio, UsuarioDesafio, Badge, UsuarioBadge
)
from schemas import DashboardResponse, UsuarioResponse, BadgeResponse
from security import get_current_user
from utils import (
    atualizar_streak, obter_ultimos_treinos, obter_badges_recentes
)
from datetime import date, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna resumo do dashboard do usuário"""
    user = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Pega streak atual
    hoje = date.today()
    semana_atras = hoje - timedelta(days=7)
    
    ultimas_execucoes = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == user.id,
        SerieExecutada.data_execucao >= semana_atras
    ).order_by(SerieExecutada.data_execucao.desc()).all()
    
    streak_atual = 0
    if ultimas_execucoes:
        datas_unicas = set()
        for exec in ultimas_execucoes:
            datas_unicas.add(exec.data_execucao.date())
        
        # Conta dias consecutivos a partir de hoje
        streak_atual = 0
        data_check = hoje
        while data_check in datas_unicas:
            streak_atual += 1
            data_check -= timedelta(days=1)
    
    # Próximos desafios
    proximos_desafios = db.query(UsuarioDesafio, Desafio).join(
        Desafio, Desafio.id == UsuarioDesafio.desafio_id
    ).filter(
        UsuarioDesafio.usuario_id == user.id,
        UsuarioDesafio.concluido == False
    ).limit(3).all()
    
    proximos = [
        {
            "id": ud.UsuarioDesafio.id,
            "titulo": ud.Desafio.titulo,
            "progresso": float(ud.UsuarioDesafio.progresso or 0),
            "alvo": float(ud.Desafio.alvo_valor or 0)
        }
        for ud in proximos_desafios
    ]
    
    return DashboardResponse(
        usuario=UsuarioResponse.model_validate(user),
        streak_atual=streak_atual,
        ultimos_treinos=obter_ultimos_treinos(db, user.id, 5),
        badges_recentes=obter_badges_recentes(db, user.id, 5),
        proximos_desafios=proximos
    )
