from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Exercicio
from schemas import ExercicioCreate, ExercicioResponse
from security import get_current_user

router = APIRouter(prefix="/exercicios", tags=["exercicios"])

@router.get("", response_model=List[ExercicioResponse])
def listar_exercicios(
    grupo_muscular: str = None,
    db: Session = Depends(get_db)
):
    """Lista exercícios disponíveis"""
    query = db.query(Exercicio)
    
    if grupo_muscular:
        query = query.filter(Exercicio.grupo_muscular == grupo_muscular)
    
    exercicios = query.all()
    return exercicios

@router.get("/{exercicio_id}", response_model=ExercicioResponse)
def obter_exercicio(
    exercicio_id: int,
    db: Session = Depends(get_db)
):
    """Obtém detalhes de um exercício"""
    exercicio = db.query(Exercicio).filter(Exercicio.id == exercicio_id).first()
    
    if not exercicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercício não encontrado"
        )
    
    return exercicio

@router.post("", response_model=ExercicioResponse)
def criar_exercicio(
    exercicio: ExercicioCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria novo exercício (apenas admin/instrutor)"""
    if current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas instrutores podem criar exercícios"
        )
    
    db_exercicio = Exercicio(
        nome=exercicio.nome,
        grupo_muscular=exercicio.grupo_muscular,
        descricao=exercicio.descricao
    )
    db.add(db_exercicio)
    db.commit()
    db.refresh(db_exercicio)
    
    return db_exercicio

@router.get("/grupos/listagem", response_model=List[str])
def listar_grupos_musculares(
    db: Session = Depends(get_db)
):
    """Lista todos os grupos musculares"""
    from sqlalchemy import distinct
    
    grupos = db.query(distinct(Exercicio.grupo_muscular)).filter(
        Exercicio.grupo_muscular.isnot(None)
    ).all()
    
    return [g[0] for g in grupos]
