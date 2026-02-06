from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Treino, TreinoAtribuido, TreinoExercicio, Exercicio, CoachStudent
from schemas import TreinoResponse, TreinoDetalheResponse, TreinoCreate, TreinoAtribuidoResponse
from security import get_current_user

router = APIRouter(prefix="/treinos", tags=["treinos"])

@router.get("")
def listar_treinos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista treinos do usuário com detalhes de exercícios"""
    # Busca treinos criados pelo usuário OU atribuídos a ele
    treinos_criados = db.query(Treino).filter(
        Treino.criado_por == current_user["user_id"]
    ).all()
    
    treinos_atribuidos = db.query(Treino).join(
        TreinoAtribuido, TreinoAtribuido.treino_id == Treino.id
    ).filter(
        TreinoAtribuido.aluno_id == current_user["user_id"],
        TreinoAtribuido.ativo == True,
        Treino.criado_por != current_user["user_id"]  # Evita duplicados
    ).all()
    
    todos_treinos = list(set(treinos_criados + treinos_atribuidos))
    
    resultado = []
    for treino in todos_treinos:
        # Busca exercícios do treino
        te = db.query(TreinoExercicio, Exercicio).join(
            Exercicio, Exercicio.id == TreinoExercicio.exercicio_id
        ).filter(TreinoExercicio.treino_id == treino.id).order_by(
            TreinoExercicio.ordem
        ).all()
        
        exercicios = [
            {
                "id": ex.Exercicio.id,
                "nome": ex.Exercicio.nome,
                "grupo_muscular": ex.Exercicio.grupo_muscular,
                "series_sugeridas": ex.TreinoExercicio.series_sugeridas,
                "reps_sugeridas": ex.TreinoExercicio.reps_sugeridas,
                "ordem": ex.TreinoExercicio.ordem,
                "instrucoes": ex.Exercicio.instrucoes,
                "dicas": ex.Exercicio.dicas,
                "nivel": ex.Exercicio.nivel,
                "equipamento": ex.Exercicio.equipamento,
            }
            for ex in te
        ]
        
        resultado.append({
            "id": treino.id,
            "nome": treino.nome,
            "descricao": treino.descricao,
            "duracao": treino.duracao or 45,
            "criado_por": treino.criado_por,
            "origem": treino.origem or "user",
            "locked": treino.locked or False,
            "criado_em": treino.criado_em,
            "exercicios": exercicios
        })
    
    return resultado

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
    """Cria novo treino - qualquer usuário pode criar seus próprios treinos.
       Coaches can create locked trainings for their students."""
    
    is_coach = current_user["perfil"] == "instrutor"
    origem = treino.origem or ("coach" if is_coach else "user")
    
    db_treino = Treino(
        nome=treino.nome,
        descricao=treino.descricao,
        duracao=treino.duracao or 45,
        criado_por=current_user["user_id"],
        origem=origem,
        locked=treino.locked if is_coach else False  # Only coaches can lock
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
    
    # If coach creating for a student, assign to student
    target_student = treino.aluno_id if (is_coach and treino.aluno_id) else None
    
    if target_student:
        # Verify coach-student connection
        connection = db.query(CoachStudent).filter(
            CoachStudent.coach_id == current_user["user_id"],
            CoachStudent.student_id == target_student,
            CoachStudent.status == "active"
        ).first()
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não está conectado a este aluno"
            )
        treino_atribuido = TreinoAtribuido(
            treino_id=db_treino.id,
            aluno_id=target_student,
            ativo=True,
            observacao=f"Criado pelo coach"
        )
        db.add(treino_atribuido)
    else:
        # Auto-atribui o treino ao próprio usuário
        treino_atribuido = TreinoAtribuido(
            treino_id=db_treino.id,
            aluno_id=current_user["user_id"],
            ativo=True
        )
        db.add(treino_atribuido)
    
    db.commit()
    db.refresh(db_treino)
    return db_treino

@router.put("/{treino_id}", response_model=TreinoResponse)
def atualizar_treino(
    treino_id: int,
    treino: TreinoCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza um treino existente"""
    db_treino = db.query(Treino).filter(Treino.id == treino_id).first()
    
    if not db_treino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Verifica se o usuário é o dono do treino ou admin
    if db_treino.criado_por != current_user["user_id"] and current_user["perfil"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar este treino"
        )
    
    # Check if training is locked by coach
    if db_treino.locked and db_treino.criado_por != current_user["user_id"] and current_user["perfil"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este treino foi bloqueado pelo seu coach e não pode ser editado"
        )
    
    # Atualiza dados básicos
    db_treino.nome = treino.nome
    db_treino.descricao = treino.descricao
    db_treino.duracao = treino.duracao or 45
    
    # Remove exercícios antigos e adiciona novos
    db.query(TreinoExercicio).filter(TreinoExercicio.treino_id == treino_id).delete()
    
    for ex in treino.exercicios:
        te = TreinoExercicio(
            treino_id=treino_id,
            exercicio_id=ex.exercicio_id,
            ordem=ex.ordem,
            series_sugeridas=ex.series_sugeridas,
            reps_sugeridas=ex.reps_sugeridas
        )
        db.add(te)
    
    db.commit()
    db.refresh(db_treino)
    return db_treino

@router.delete("/{treino_id}")
def deletar_treino(
    treino_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta um treino"""
    db_treino = db.query(Treino).filter(Treino.id == treino_id).first()
    
    if not db_treino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado"
        )
    
    # Verifica se o usuário é o dono do treino ou admin
    if db_treino.criado_por != current_user["user_id"] and current_user["perfil"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar este treino"
        )
    
    # Remove atribuições
    db.query(TreinoAtribuido).filter(TreinoAtribuido.treino_id == treino_id).delete()
    
    # Remove exercícios do treino
    db.query(TreinoExercicio).filter(TreinoExercicio.treino_id == treino_id).delete()
    
    # Remove o treino
    db.delete(db_treino)
    db.commit()
    
    return {"message": "Treino deletado com sucesso"}