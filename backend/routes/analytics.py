from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import AnalyticsResponse
from security import get_current_user
from models import Usuario
from utils import (
    calcular_volume_total, calcular_frequencia_semanal,
    calcular_distribuicao_muscular, obter_exercicios_favoritos
)
from datetime import date, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{usuario_id}", response_model=AnalyticsResponse)
def obter_analytics(
    usuario_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna dados de analytics do usuário para gráficos"""
    # Verifica permissão
    if current_user["user_id"] != usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar analytics deste usuário"
        )
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Calcula métricas
    volume_total = calcular_volume_total(db, usuario_id, 30)
    frequencia_semanal = calcular_frequencia_semanal(db, usuario_id)
    
    # Progressão dos últimos 30 dias
    data_inicio = date.today() - timedelta(days=30)
    from models import SerieExecutada
    series = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= data_inicio
    ).all()
    
    progressao = {}
    for serie in series:
        data_str = serie.data_execucao.date().isoformat()
        if data_str not in progressao:
            progressao[data_str] = {"volume": 0, "series": 0}
        progressao[data_str]["volume"] += float(serie.carga_kg or 0) * serie.repeticoes
        progressao[data_str]["series"] += 1
    
    distribuicao = calcular_distribuicao_muscular(db, usuario_id, 30)
    favoritos = obter_exercicios_favoritos(db, usuario_id, 10)
    
    return AnalyticsResponse(
        volume_total=volume_total,
        frequencia_semanal=frequencia_semanal,
        progressao_ultimos_30_dias=progressao,
        distribuicao_muscular=distribuicao,
        exercicios_favoritos=favoritos
    )

@router.get("/{usuario_id}/comparativo")
def obter_comparativo(
    usuario_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Comparativo de performance semana por semana"""
    if current_user["user_id"] != usuario_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão"
        )
    
    from models import SerieExecutada
    from sqlalchemy import func
    import math
    
    # Últimas 12 semanas
    semanas = []
    for i in range(12):
        data_fim = date.today() - timedelta(weeks=i)
        data_inicio = data_fim - timedelta(days=7)
        
        series = db.query(
            func.sum(SerieExecutada.carga_kg * SerieExecutada.repeticoes).label("volume"),
            func.count(SerieExecutada.id).label("series")
        ).filter(
            SerieExecutada.aluno_id == usuario_id,
            SerieExecutada.data_execucao >= data_inicio,
            SerieExecutada.data_execucao <= data_fim
        ).first()
        
        semana_ano = data_fim.isocalendar()[1]
        
        semanas.append({
            "semana": f"W{semana_ano}",
            "data": data_fim.isoformat(),
            "volume": float(series.volume or 0),
            "series": series.series or 0
        })
    
    return semanas[::-1]  # Inverte para ordem cronológica
