from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import SerieExecutada, Usuario, Exercicio
from schemas import SerieExecutadaResponse
from security import get_current_user
from datetime import date, timedelta
from sqlalchemy import func

router = APIRouter(prefix="/historico", tags=["historico"])

@router.get("/{usuario_id}", response_model=List[dict])
def obter_historico(
    usuario_id: int,
    dias: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém histórico de treinos de um usuário"""
    # Verifica permissão
    if current_user["user_id"] != usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para ver histórico deste usuário"
        )
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    data_inicio = date.today() - timedelta(days=dias)
    
    series = db.query(SerieExecutada, Exercicio).join(
        Exercicio, Exercicio.id == SerieExecutada.exercicio_id
    ).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= data_inicio
    ).order_by(SerieExecutada.data_execucao.desc()).all()
    
    return [
        {
            "id": s.SerieExecutada.id,
            "exercicio_id": s.Exercicio.id,
            "exercicio_nome": s.Exercicio.nome,
            "grupo_muscular": s.Exercicio.grupo_muscular,
            "data": s.SerieExecutada.data_execucao.isoformat(),
            "serie": s.SerieExecutada.serie_num,
            "repeticoes": s.SerieExecutada.repeticoes,
            "carga_kg": float(s.SerieExecutada.carga_kg or 0),
            "observacao": s.SerieExecutada.observacao
        }
        for s in series
    ]

@router.get("/{usuario_id}/resumo-por-dia")
def obter_resumo_por_dia(
    usuario_id: int,
    dias: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resumo de treinos agrupado por dia"""
    if current_user["user_id"] != usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão"
        )
    
    data_inicio = date.today() - timedelta(days=dias)
    
    series = db.query(
        func.date(SerieExecutada.data_execucao).label("dia"),
        func.count(SerieExecutada.id).label("series"),
        func.sum(SerieExecutada.repeticoes).label("reps_total"),
        func.sum(SerieExecutada.carga_kg * SerieExecutada.repeticoes).label("volume")
    ).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= data_inicio
    ).group_by(
        func.date(SerieExecutada.data_execucao)
    ).order_by(
        func.date(SerieExecutada.data_execucao).desc()
    ).all()
    
    return [
        {
            "dia": s.dia.isoformat(),
            "series_executadas": s.series,
            "repeticoes_total": s.reps_total or 0,
            "volume_total": float(s.volume or 0)
        }
        for s in series
    ]
