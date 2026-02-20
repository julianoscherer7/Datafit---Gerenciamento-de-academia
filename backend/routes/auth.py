from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import logging
from database import get_db
from models import Usuario, UsuarioProgresso, CoachStudent, CoachInviteToken
from schemas import (
    UsuarioRegister, UsuarioLogin, TokenResponse, UsuarioResponse, UsuarioUpdate
)
from security import (
    hash_password, verify_password, create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(user: UsuarioRegister, db: Session = Depends(get_db)):
    """Registra novo usuário (aluno or instrutor)"""
    logger.info(f"[REGISTER] Tentativa de registro para email: {user.email}, perfil: {user.perfil}")
    
    # Verifica se email já existe (case insensitive)
    existing = db.query(Usuario).filter(Usuario.email.ilike(user.email.strip())).first()
    if existing:
        logger.warning(f"[REGISTER] Email já cadastrado: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado. Tente fazer login ou use outro email."
        )
    
    # Verifica se nickname já existe (se fornecido)
    if user.nickname:
        nickname_clean = user.nickname.strip().lower()
        existing_nickname = db.query(Usuario).filter(Usuario.nickname == nickname_clean).first()
        if existing_nickname:
            logger.warning(f"[REGISTER] Nickname já em uso: {user.nickname}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nickname já em uso. Escolha outro."
            )
    
    # Validate coach registration
    perfil = user.perfil or "aluno"
    coach_status = None
    if perfil == "instrutor":
        if not user.cref:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CREF é obrigatório para registro como instrutor."
            )
        coach_status = "pending"  # Coaches need admin approval
    
    # Cria novo usuário
    try:
        hashed = hash_password(user.senha)
        logger.info(f"[REGISTER] Hash gerado com sucesso para {user.email}")
        
        db_user = Usuario(
            nome=user.nome.strip(),
            nickname=user.nickname.strip().lower() if user.nickname else None,
            email=user.email.strip().lower(),
            senha_hash=hashed,
            perfil=perfil,
            coach_status=coach_status,
            cref=user.cref,
            especialidade=user.especialidade,
            coach_bio=user.coach_bio,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"[REGISTER] Usuário criado com sucesso: ID={db_user.id}, email={db_user.email}, perfil={perfil}")
        
        # If student registered with an invite_token, auto-connect to coach
        if user.invite_token and perfil == "aluno":
            invite = db.query(CoachInviteToken).filter(
                CoachInviteToken.token == user.invite_token,
                CoachInviteToken.active == True
            ).first()
            if invite and (invite.expires_at is None or invite.expires_at > datetime.utcnow()) and invite.uses < invite.max_uses:
                connection = CoachStudent(
                    coach_id=invite.coach_id,
                    student_id=db_user.id,
                    status="active",
                    connected_at=datetime.utcnow()
                )
                db.add(connection)
                invite.uses += 1
                db.commit()
                logger.info(f"[REGISTER] Aluno auto-conectado ao coach ID={invite.coach_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"[REGISTER] Erro ao criar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao criar conta. Tente novamente."
        )
    
    # Cria token (include coach_status for coaches)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(db_user.id), "perfil": db_user.perfil}
    if db_user.coach_status:
        token_data["coach_status"] = db_user.coach_status
    
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    logger.info(f"[REGISTER] Token gerado para usuário ID={db_user.id}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "perfil": db_user.perfil,
        "coach_status": db_user.coach_status
    }

@router.post("/login", response_model=TokenResponse)
def login(user: UsuarioLogin, db: Session = Depends(get_db)):
    """Faz login do usuário"""
    logger.info(f"[LOGIN] Tentativa de login para email: {user.email}")
    
    # Busca usuário (case insensitive)
    db_user = db.query(Usuario).filter(Usuario.email.ilike(user.email.strip())).first()
    
    if not db_user:
        logger.warning(f"[LOGIN] Email não encontrado: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email não cadastrado. Verifique o email ou crie uma conta."
        )
    
    # Verifica senha
    if not verify_password(user.senha, db_user.senha_hash):
        logger.warning(f"[LOGIN] Senha incorreta para email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta. Verifique e tente novamente."
        )
    
    logger.info(f"[LOGIN] Login bem-sucedido: ID={db_user.id}, email={db_user.email}")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(db_user.id), "perfil": db_user.perfil}
    if db_user.coach_status:
        token_data["coach_status"] = db_user.coach_status
    
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "perfil": db_user.perfil,
        "coach_status": db_user.coach_status
    }

@router.get("/me")
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtém info do usuário autenticado incluindo dados de gamificação"""
    logger.info(f"[ME] Buscando dados do usuário ID={current_user['user_id']}")
    
    user = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    if not user:
        logger.error(f"[ME] Usuário não encontrado: ID={current_user['user_id']}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Update last activity timestamp
    try:
        user.ultimo_acesso = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()
    
    # Buscar dados de progresso/gamificação
    progresso = db.query(UsuarioProgresso).filter(UsuarioProgresso.usuario_id == user.id).first()
    
    # Montar resposta com dados do usuário e gamificação
    response = {
        "id": user.id,
        "nome": user.nome,
        "nickname": user.nickname,
        "email": user.email,
        "perfil": user.perfil,
        "coach_status": user.coach_status,
        "cref": user.cref,
        "especialidade": user.especialidade,
        "coach_bio": user.coach_bio,
        "foto_url": user.foto_url,
        "foto_base64": user.foto_base64,
        "banner_base64": user.banner_base64,
        "bio": user.bio,
        "data_nascimento": str(user.data_nascimento) if user.data_nascimento else None,
        "peso_kg": float(user.peso_kg) if user.peso_kg else None,
        "altura_cm": float(user.altura_cm) if user.altura_cm else None,
        "genero": user.genero,
        "instagram": user.instagram,
        "tiktok": user.tiktok,
        "twitter": user.twitter,
        "linkedin": user.linkedin,
        "criado_em": user.criado_em,
        # Dados de gamificação
        "nivel": progresso.nivel if progresso else 1,
        "xp_total": progresso.xp_total if progresso else 0,
        "moedas": progresso.moedas if progresso else 0,
        "titulo_atual": progresso.titulo_atual if progresso else "Iniciante"
    }
    
    logger.info(f"[ME] Dados retornados para usuário: {user.email}")
    return response

@router.put("/me", response_model=UsuarioResponse)
def update_current_user(
    user_data: UsuarioUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do usuário autenticado"""
    logger.info(f"[UPDATE] Atualizando perfil do usuário ID={current_user['user_id']}")
    
    user = db.query(Usuario).filter(Usuario.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verifica se nickname já existe (se fornecido e diferente do atual)
    if user_data.nickname:
        nickname_clean = user_data.nickname.strip().lower()
        existing_nickname = db.query(Usuario).filter(
            Usuario.nickname == nickname_clean,
            Usuario.id != user.id
        ).first()
        if existing_nickname:
            logger.warning(f"[UPDATE] Nickname já em uso: {user_data.nickname}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nickname já em uso. Escolha outro."
            )
    
    # Atualiza campos fornecidos
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            # Normaliza nickname para lowercase
            if field == 'nickname' and value:
                value = value.strip().lower()
            setattr(user, field, value)
    
    try:
        db.commit()
        db.refresh(user)
        logger.info(f"[UPDATE] Perfil atualizado com sucesso: ID={user.id}")
    except Exception as e:
        db.rollback()
        logger.error(f"[UPDATE] Erro ao atualizar perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar alterações"
        )
    
    return user

@router.get("/check-email/{email}")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Verifica se email já está cadastrado (útil para validação no frontend)"""
    exists = db.query(Usuario).filter(Usuario.email.ilike(email.strip())).first() is not None
    return {"exists": exists, "email": email.lower()}
