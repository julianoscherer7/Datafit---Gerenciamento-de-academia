from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import SerieExecutada, TreinoAtribuido
from schemas import SerieExecutadaCreate, SerieExecutadaResponse
from security import get_current_user
from utils import atualizar_streak

router = APIRouter(prefix="/execucao", tags=["execucao"])

@router.post("/{aluno_id}", response_model=SerieExecutadaResponse)
def registrar_serie(
    aluno_id: int,
    serie: SerieExecutadaCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra execução de série de exercício"""
    # Apenas o próprio usuário ou instrutor pode registrar
    if current_user["user_id"] != aluno_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para registrar série deste usuário"
        )
    
    # Cria registro de série
    db_serie = SerieExecutada(
        aluno_id=aluno_id,
        exercicio_id=serie.exercicio_id,
        serie_num=serie.serie_num,
        repeticoes=serie.repeticoes,
        carga_kg=serie.carga_kg,
        observacao=serie.observacao
    )
    db.add(db_serie)
    db.commit()
    
    # Atualiza streak
    atualizar_streak(db, aluno_id)
    
    db.refresh(db_serie)
    return db_serie

@router.get("/{aluno_id}/historico", response_model=List[SerieExecutadaResponse])
def obter_historico_series(
    aluno_id: int,
    exercicio_id: int = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém histórico de séries de um usuário"""
    # Apenas o próprio usuário ou instrutor pode ver
    if current_user["user_id"] != aluno_id and current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para ver histórico deste usuário"
        )
    
    query = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == aluno_id
    )
    
    if exercicio_id:
        query = query.filter(SerieExecutada.exercicio_id == exercicio_id)
    
    series = query.order_by(SerieExecutada.data_execucao.desc()).limit(limit).all()
    
    return series
