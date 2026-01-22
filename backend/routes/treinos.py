from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Treino, TreinoAtribuido, TreinoExercicio, Exercicio
from schemas import TreinoResponse, TreinoDetalheResponse, TreinoCreate, TreinoAtribuidoResponse
from security import get_current_user

router = APIRouter(prefix="/treinos", tags=["treinos"])

@router.get("", response_model=List[TreinoAtribuidoResponse])
def listar_treinos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista treinos atribuídos ao usuário"""
    treinos = db.query(TreinoAtribuido).filter(
        TreinoAtribuido.aluno_id == current_user["user_id"],
        TreinoAtribuido.ativo == True
    ).all()
    
    return treinos

@router.get("/{treino_id}", response_model=TreinoDetalheResponse)
def obter_treino(
    treino_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém detalhes de um treino específico"""
    treino = db.query(Treino).filter(Treino.id == treino_id).first()
    
    if not treino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Obtém exercícios do treino
    te = db.query(TreinoExercicio, Exercicio).join(
        Exercicio, Exercicio.id == TreinoExercicio.exercicio_id
    ).filter(TreinoExercicio.treino_id == treino_id).order_by(
        TreinoExercicio.ordem
    ).all()
    
    exercicios = [
        {
            "id": ex.Exercicio.id,
            "nome": ex.Exercicio.nome,
            "grupo_muscular": ex.Exercicio.grupo_muscular,
            "series_sugeridas": ex.TreinoExercicio.series_sugeridas,
            "reps_sugeridas": ex.TreinoExercicio.reps_sugeridas,
            "ordem": ex.TreinoExercicio.ordem
        }
        for ex in te
    ]
    
    return TreinoDetalheResponse(
        id=treino.id,
        nome=treino.nome,
        descricao=treino.descricao,
        criado_por=treino.criado_por,
        criado_em=treino.criado_em,
        exercicios=exercicios
    )

@router.post("", response_model=TreinoResponse)
def criar_treino(
    treino: TreinoCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria novo treino (apenas instrutor/admin)"""
    if current_user["perfil"] not in ["instrutor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas instrutores podem criar treinos"
        )
    
    db_treino = Treino(
        nome=treino.nome,
        descricao=treino.descricao,
        criado_por=current_user["user_id"]
    )
    db.add(db_treino)
    db.flush()
    
    # Adiciona exercícios
    for ex in treino.exercicios:
        te = TreinoExercicio(
            treino_id=db_treino.id,
            exercicio_id=ex.exercicio_id,
            ordem=ex.ordem,
            series_sugeridas=ex.series_sugeridas,
            reps_sugeridas=ex.reps_sugeridas
        )
        db.add(te)
    
    db.commit()
    db.refresh(db_treino)
    return db_treino
