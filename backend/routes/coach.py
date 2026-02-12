"""
Coach Management Routes
- Invite tokens (create, list, revoke)
- Student connections (list, accept, reject, remove)
- Coach discovery & connection by token
- Admin coach approval
- Coach dashboard data
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import logging

from database import get_db
from models import (
    Usuario, CoachStudent, CoachInviteToken, Treino, TreinoAtribuido,
    SerieExecutada, Exercicio, TreinoExercicio, PresenceValidation
)
from schemas import (
    CoachStudentResponse, InviteTokenCreate, InviteTokenResponse,
    ConnectByTokenRequest, CoachApprovalRequest
)
from security import get_current_user, require_approved_coach, require_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/coach", tags=["coach"])


# ==================== INVITE TOKENS ====================

@router.post("/invite-token", response_model=InviteTokenResponse)
def create_invite_token(
    data: InviteTokenCreate,
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Coach creates an invite code for students to connect — short 6-char code, never expires"""
    # Generate a short, easy-to-share 6-char alphanumeric code
    import random, string
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Deactivate any previous tokens from this coach
    db.query(CoachInviteToken).filter(
        CoachInviteToken.coach_id == current_user["user_id"],
        CoachInviteToken.active == True
    ).update({"active": False})
    
    invite = CoachInviteToken(
        coach_id=current_user["user_id"],
        token=code,
        max_uses=data.max_uses or 999,
        expires_at=None  # Never expires
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    
    logger.info(f"[COACH] Código de convite '{code}' criado pelo coach ID={current_user['user_id']}")
    return invite


@router.get("/invite-tokens")
def list_invite_tokens(
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """List all invite tokens for this coach"""
    tokens = db.query(CoachInviteToken).filter(
        CoachInviteToken.coach_id == current_user["user_id"]
    ).order_by(CoachInviteToken.criado_em.desc()).all()
    
    return [
        {
            "id": t.id,
            "token": t.token,
            "max_uses": t.max_uses,
            "uses": t.uses,
            "expires_at": t.expires_at,
            "active": t.active and (t.expires_at is None or t.expires_at > datetime.utcnow()) and t.uses < t.max_uses,
            "criado_em": t.criado_em
        }
        for t in tokens
    ]


@router.delete("/invite-token/{token_id}")
def revoke_invite_token(
    token_id: int,
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Revoke an invite token"""
    invite = db.query(CoachInviteToken).filter(
        CoachInviteToken.id == token_id,
        CoachInviteToken.coach_id == current_user["user_id"]
    ).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Token não encontrado")
    
    invite.active = False
    db.commit()
    return {"message": "Token revogado com sucesso"}


# ==================== STUDENT CONNECTION ====================

@router.post("/connect-by-token")
def connect_by_token(
    data: ConnectByTokenRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Student connects to a coach using an invite code"""
    if current_user["perfil"] != "aluno":
        raise HTTPException(status_code=400, detail="Apenas alunos podem se conectar a um coach via código")
    
    # Find and validate code (case-insensitive)
    invite = db.query(CoachInviteToken).filter(
        CoachInviteToken.token == data.token.strip().upper(),
        CoachInviteToken.active == True
    ).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Código inválido. Verifique com seu instrutor.")
    
    # Only check expiry if set (new codes don't expire)
    if invite.expires_at and invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Código expirado. Peça um novo ao seu instrutor.")
    
    if invite.max_uses and invite.uses >= invite.max_uses:
        raise HTTPException(status_code=400, detail="Código já atingiu o limite de usos")
    
    # Check if already connected
    existing = db.query(CoachStudent).filter(
        CoachStudent.coach_id == invite.coach_id,
        CoachStudent.student_id == current_user["user_id"]
    ).first()
    
    if existing:
        if existing.status == "active":
            raise HTTPException(status_code=400, detail="Você já está conectado a este coach")
        elif existing.status == "pending":
            raise HTTPException(status_code=400, detail="Solicitação já pendente para este coach")
        else:
            # Reactivate removed/rejected connection
            existing.status = "active"
            existing.connected_at = datetime.utcnow()
            invite.uses += 1
            db.commit()
            return {"message": "Conexão reativada com sucesso", "coach_id": invite.coach_id}
    
    # Create connection
    connection = CoachStudent(
        coach_id=invite.coach_id,
        student_id=current_user["user_id"],
        status="active",
        connected_at=datetime.utcnow()
    )
    db.add(connection)
    invite.uses += 1
    db.commit()
    
    coach = db.query(Usuario).filter(Usuario.id == invite.coach_id).first()
    logger.info(f"[COACH] Aluno ID={current_user['user_id']} conectou ao coach ID={invite.coach_id}")
    
    return {
        "message": f"Conectado ao coach {coach.nome} com sucesso!",
        "coach_id": invite.coach_id,
        "coach_name": coach.nome
    }


@router.get("/my-students")
def list_my_students(
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Coach lists their connected students"""
    connections = db.query(CoachStudent, Usuario).join(
        Usuario, Usuario.id == CoachStudent.student_id
    ).filter(
        CoachStudent.coach_id == current_user["user_id"]
    ).all()
    
    result = []
    for conn, student in connections:
        # Get student's recent activity
        recent_series = db.query(SerieExecutada).filter(
            SerieExecutada.aluno_id == student.id
        ).order_by(SerieExecutada.data_execucao.desc()).limit(1).first()
        
        result.append({
            "connection_id": conn.id,
            "student_id": student.id,
            "student_name": student.nome,
            "student_email": student.email,
            "student_foto": student.foto_base64 or student.foto_url,
            "status": conn.status,
            "connected_at": conn.connected_at,
            "last_activity": recent_series.data_execucao if recent_series else None
        })
    
    return result


@router.get("/my-coach")
def get_my_coach(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Student gets their connected coach info"""
    connection = db.query(CoachStudent, Usuario).join(
        Usuario, Usuario.id == CoachStudent.coach_id
    ).filter(
        CoachStudent.student_id == current_user["user_id"],
        CoachStudent.status == "active"
    ).first()
    
    if not connection:
        return {"connected": False, "coach": None}
    
    conn, coach = connection
    student_count = db.query(CoachStudent).filter(
        CoachStudent.coach_id == coach.id,
        CoachStudent.status == "active"
    ).count()
    
    return {
        "connected": True,
        "coach": {
            "id": coach.id,
            "nome": coach.nome,
            "email": coach.email,
            "foto": coach.foto_base64 or coach.foto_url,
            "especialidade": coach.especialidade,
            "coach_bio": coach.coach_bio,
            "cref": coach.cref,
            "total_students": student_count,
            "connected_at": conn.connected_at
        }
    }


@router.delete("/disconnect/{student_id}")
def disconnect_student(
    student_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Coach removes a student OR student disconnects from coach"""
    is_coach = current_user["perfil"] == "instrutor"
    
    if is_coach:
        conn = db.query(CoachStudent).filter(
            CoachStudent.coach_id == current_user["user_id"],
            CoachStudent.student_id == student_id
        ).first()
    else:
        conn = db.query(CoachStudent).filter(
            CoachStudent.coach_id == student_id,
            CoachStudent.student_id == current_user["user_id"]
        ).first()
    
    if not conn:
        raise HTTPException(status_code=404, detail="Conexão não encontrada")
    
    conn.status = "removed"
    db.commit()
    return {"message": "Conexão removida com sucesso"}


# ==================== COACH DASHBOARD ====================

@router.get("/dashboard")
def coach_dashboard(
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Get coach dashboard data with student stats"""
    coach_id = current_user["user_id"]
    
    # My students
    active_students = db.query(CoachStudent).filter(
        CoachStudent.coach_id == coach_id,
        CoachStudent.status == "active"
    ).count()
    
    pending_students = db.query(CoachStudent).filter(
        CoachStudent.coach_id == coach_id,
        CoachStudent.status == "pending"
    ).count()
    
    # Trainings created by this coach
    total_treinos = db.query(Treino).filter(
        Treino.criado_por == coach_id
    ).count()
    
    # Student IDs
    student_ids = [s.student_id for s in db.query(CoachStudent).filter(
        CoachStudent.coach_id == coach_id, CoachStudent.status == "active"
    ).all()]
    
    # Recent activities from students
    recent_activities = []
    if student_ids:
        recent = db.query(SerieExecutada, Usuario).join(
            Usuario, Usuario.id == SerieExecutada.aluno_id
        ).filter(
            SerieExecutada.aluno_id.in_(student_ids)
        ).order_by(SerieExecutada.data_execucao.desc()).limit(10).all()
        
        for serie, student in recent:
            exercicio = db.query(Exercicio).filter(Exercicio.id == serie.exercicio_id).first()
            recent_activities.append({
                "student_name": student.nome,
                "student_id": student.id,
                "exercicio": exercicio.nome if exercicio else "Exercício",
                "carga_kg": float(serie.carga_kg) if serie.carga_kg else 0,
                "repeticoes": serie.repeticoes,
                "data": serie.data_execucao
            })
    
    # Today's validations
    today = datetime.utcnow().date()
    validations_today = 0
    if student_ids:
        validations_today = db.query(PresenceValidation).filter(
            PresenceValidation.usuario_id.in_(student_ids),
            PresenceValidation.criado_em >= datetime.combine(today, datetime.min.time())
        ).count()
    
    return {
        "active_students": active_students,
        "pending_students": pending_students,
        "total_treinos": total_treinos,
        "validations_today": validations_today,
        "recent_activities": recent_activities,
        "student_ids": student_ids
    }


@router.get("/student/{student_id}/details")
def get_student_details(
    student_id: int,
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Coach gets detailed info about a specific student"""
    # Verify connection
    conn = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user["user_id"],
        CoachStudent.student_id == student_id,
        CoachStudent.status == "active"
    ).first()
    
    if not conn:
        raise HTTPException(status_code=403, detail="Você não está conectado a este aluno")
    
    student = db.query(Usuario).filter(Usuario.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Get student's trainings
    treinos = db.query(Treino).join(
        TreinoAtribuido, TreinoAtribuido.treino_id == Treino.id
    ).filter(
        TreinoAtribuido.aluno_id == student_id,
        TreinoAtribuido.ativo == True
    ).all()
    
    # Get recent series
    recent_series = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == student_id
    ).order_by(SerieExecutada.data_execucao.desc()).limit(20).all()
    
    # Get presence validations
    validations = db.query(PresenceValidation).filter(
        PresenceValidation.usuario_id == student_id
    ).order_by(PresenceValidation.criado_em.desc()).limit(10).all()
    
    return {
        "student": {
            "id": student.id,
            "nome": student.nome,
            "email": student.email,
            "foto": student.foto_base64 or student.foto_url,
            "peso_kg": float(student.peso_kg) if student.peso_kg else None,
            "altura_cm": float(student.altura_cm) if student.altura_cm else None,
            "bio": student.bio
        },
        "treinos": [
            {"id": t.id, "nome": t.nome, "descricao": t.descricao, "origem": t.origem, "locked": t.locked}
            for t in treinos
        ],
        "recent_series": [
            {
                "exercicio_id": s.exercicio_id,
                "carga_kg": float(s.carga_kg) if s.carga_kg else 0,
                "repeticoes": s.repeticoes,
                "serie_num": s.serie_num,
                "data": s.data_execucao
            }
            for s in recent_series
        ],
        "validations": [
            {"id": v.id, "validated": v.validated, "method": v.method, "data": v.criado_em}
            for v in validations
        ]
    }


# ==================== ADMIN: COACH APPROVAL ====================

@router.get("/pending-coaches")
def list_pending_coaches(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin lists coaches pending approval"""
    pending = db.query(Usuario).filter(
        Usuario.perfil == "instrutor",
        Usuario.coach_status == "pending"
    ).all()
    
    return [
        {
            "id": c.id,
            "nome": c.nome,
            "email": c.email,
            "cref": c.cref,
            "especialidade": c.especialidade,
            "coach_bio": c.coach_bio,
            "criado_em": c.criado_em
        }
        for c in pending
    ]


@router.post("/approve-coach")
def approve_or_reject_coach(
    data: CoachApprovalRequest,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin approves or rejects a coach"""
    coach = db.query(Usuario).filter(
        Usuario.id == data.coach_id,
        Usuario.perfil == "instrutor"
    ).first()
    
    if not coach:
        raise HTTPException(status_code=404, detail="Coach não encontrado")
    
    if data.action == "approve":
        coach.coach_status = "approved"
        msg = f"Coach {coach.nome} aprovado com sucesso"
    elif data.action == "reject":
        coach.coach_status = "rejected"
        msg = f"Coach {coach.nome} rejeitado"
    else:
        raise HTTPException(status_code=400, detail="Ação inválida. Use 'approve' ou 'reject'")
    
    db.commit()
    logger.info(f"[ADMIN] {msg} por admin ID={current_user['user_id']}")
    return {"message": msg}


# ==================== PRESENCE VALIDATION ====================

@router.post("/validate-presence")
def validate_presence(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Student validates presence with selfie before training"""
    validation = PresenceValidation(
        usuario_id=current_user["user_id"],
        treino_id=data.get("treino_id"),
        foto_base64=data.get("foto_base64"),
        validated=True,
        method=data.get("method", "selfie")
    )
    db.add(validation)
    db.commit()
    db.refresh(validation)
    
    logger.info(f"[VALIDATION] Presença validada para user ID={current_user['user_id']}")
    return {
        "id": validation.id,
        "validated": True,
        "method": validation.method,
        "criado_em": validation.criado_em
    }


@router.get("/validations")
def list_validations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List presence validations for the current user"""
    validations = db.query(PresenceValidation).filter(
        PresenceValidation.usuario_id == current_user["user_id"]
    ).order_by(PresenceValidation.criado_em.desc()).limit(30).all()
    
    return [
        {
            "id": v.id,
            "treino_id": v.treino_id,
            "validated": v.validated,
            "method": v.method,
            "criado_em": v.criado_em
        }
        for v in validations
    ]


# ==================== ASSIGN EXISTING TREINO ====================

@router.post("/assign-treino")
def assign_treino_to_student(
    data: dict,
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Assign an existing treino to a student"""
    treino_id = data.get("treino_id")
    aluno_id = data.get("aluno_id")
    
    if not treino_id or not aluno_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="treino_id e aluno_id são obrigatórios"
        )
    
    # Verify coach-student connection
    connection = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user["user_id"],
        CoachStudent.student_id == aluno_id,
        CoachStudent.status == "active"
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não está conectado a este aluno"
        )
    
    # Verify treino exists and belongs to this coach
    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.criado_por == current_user["user_id"]
    ).first()
    
    if not treino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treino não encontrado ou não pertence a você"
        )
    
    # Check if already assigned
    existing = db.query(TreinoAtribuido).filter(
        TreinoAtribuido.treino_id == treino_id,
        TreinoAtribuido.aluno_id == aluno_id,
        TreinoAtribuido.ativo == True
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Treino já atribuído a este aluno"
        )
    
    # Create assignment
    treino_atribuido = TreinoAtribuido(
        treino_id=treino_id,
        aluno_id=aluno_id,
        ativo=True
    )
    db.add(treino_atribuido)
    db.commit()
    
    logger.info(f"[COACH] Treino ID={treino_id} atribuído ao aluno ID={aluno_id} pelo coach ID={current_user['user_id']}")
    
    return {
        "message": "Treino atribuído com sucesso",
        "treino_id": treino_id,
        "aluno_id": aluno_id
    }


# ==================== UNASSIGN TREINO FROM STUDENT ====================

@router.post("/unassign-treino")
def unassign_treino_from_student(
    data: dict,
    current_user: dict = Depends(require_approved_coach),
    db: Session = Depends(get_db)
):
    """Unassign (unlink) a treino from a student"""
    treino_id = data.get("treino_id")
    aluno_id = data.get("aluno_id")
    
    if not treino_id or not aluno_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="treino_id e aluno_id são obrigatórios"
        )
    
    # Verify coach-student connection
    connection = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user["user_id"],
        CoachStudent.student_id == aluno_id,
        CoachStudent.status == "active"
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não está conectado a este aluno"
        )
    
    # Find and deactivate the assignment
    assignment = db.query(TreinoAtribuido).filter(
        TreinoAtribuido.treino_id == treino_id,
        TreinoAtribuido.aluno_id == aluno_id,
        TreinoAtribuido.ativo == True
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atribuição não encontrada"
        )
    
    assignment.ativo = False
    db.commit()
    
    logger.info(f"[COACH] Treino ID={treino_id} desvinculado do aluno ID={aluno_id}")
    
    return {
        "message": "Treino desvinculado com sucesso",
        "treino_id": treino_id,
        "aluno_id": aluno_id
    }
