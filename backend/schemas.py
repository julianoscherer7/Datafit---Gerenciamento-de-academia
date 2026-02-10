from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# Auth Schemas
class UsuarioRegister(BaseModel):
    nome: str
    nickname: Optional[str] = None
    email: EmailStr
    senha: str
    perfil: Optional[str] = "aluno"
    # Coach fields
    cref: Optional[str] = None
    especialidade: Optional[str] = None
    coach_bio: Optional[str] = None
    invite_token: Optional[str] = None  # Token to connect with coach on register

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    perfil: str
    coach_status: Optional[str] = None

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    nickname: Optional[str] = None
    email: str
    perfil: str
    coach_status: Optional[str] = None
    cref: Optional[str] = None
    especialidade: Optional[str] = None
    coach_bio: Optional[str] = None
    foto_url: Optional[str] = None
    foto_base64: Optional[str] = None
    banner_base64: Optional[str] = None
    bio: Optional[str] = None
    data_nascimento: Optional[date] = None
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    genero: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    criado_em: datetime
    
    class Config:
        from_attributes = True

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    nickname: Optional[str] = None
    foto_url: Optional[str] = None
    foto_base64: Optional[str] = None
    banner_base64: Optional[str] = None
    bio: Optional[str] = None
    data_nascimento: Optional[date] = None
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    genero: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    # Coach-specific updates
    cref: Optional[str] = None
    especialidade: Optional[str] = None
    coach_bio: Optional[str] = None

# === COACH SCHEMAS ===
class CoachRegister(BaseModel):
    nome: str
    nickname: Optional[str] = None
    email: EmailStr
    senha: str
    cref: str
    especialidade: Optional[str] = None
    coach_bio: Optional[str] = None

class CoachStudentResponse(BaseModel):
    id: int
    coach_id: int
    student_id: int
    status: str
    connected_at: Optional[datetime] = None
    criado_em: datetime
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_foto: Optional[str] = None
    coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    
    class Config:
        from_attributes = True

class InviteTokenCreate(BaseModel):
    max_uses: Optional[int] = 1
    expires_hours: Optional[int] = 168  # 7 days default

class InviteTokenResponse(BaseModel):
    id: int
    token: str
    max_uses: int
    uses: int
    expires_at: Optional[datetime] = None
    active: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True

class ConnectByTokenRequest(BaseModel):
    token: str

class CoachApprovalRequest(BaseModel):
    coach_id: int
    action: str  # "approve" or "reject"

# === PRESENCE VALIDATION ===
class PresenceValidationCreate(BaseModel):
    treino_id: Optional[int] = None
    foto_base64: Optional[str] = None
    method: Optional[str] = "selfie"

class PresenceValidationResponse(BaseModel):
    id: int
    usuario_id: int
    treino_id: Optional[int] = None
    validated: bool
    method: str
    criado_em: datetime
    
    class Config:
        from_attributes = True

# === AI ASSISTANT ===
class AIAssistantRequest(BaseModel):
    message: str
    context: Optional[str] = None  # "coach_training", "exercise_suggestion", etc.
    student_id: Optional[int] = None

class AIAssistantResponse(BaseModel):
    response: str
    suggestions: Optional[List[dict]] = None
    exercises: Optional[List[dict]] = None

# Exercicio Schemas
class ExercicioCreate(BaseModel):
    nome: str
    grupo_muscular: Optional[str] = None
    descricao: Optional[str] = None
    instrucoes: Optional[str] = None
    dicas: Optional[str] = None
    musculos_trabalhados: Optional[str] = None
    nivel: Optional[str] = "iniciante"
    equipamento: Optional[str] = None

class ExercicioResponse(BaseModel):
    id: int
    nome: str
    grupo_muscular: Optional[str]
    descricao: Optional[str]
    instrucoes: Optional[str] = None
    dicas: Optional[str] = None
    musculos_trabalhados: Optional[str] = None
    nivel: Optional[str] = None
    equipamento: Optional[str] = None
    video_url: Optional[str] = None
    imagem_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# Treino Schemas
class TreinoExercicioCreate(BaseModel):
    exercicio_id: int
    ordem: int
    series_sugeridas: Optional[str] = None
    reps_sugeridas: Optional[str] = None
    tecnica: Optional[str] = None
    observacao: Optional[str] = None
    descanso: Optional[str] = None

class TreinoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    duracao: Optional[int] = 45
    exercicios: List[TreinoExercicioCreate] = []
    origem: Optional[str] = "user"  # user, coach, ai
    locked: Optional[bool] = False
    aluno_id: Optional[int] = None  # If coach creates for a student

class TreinoResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    duracao: Optional[int] = 45
    criado_por: Optional[int]
    origem: Optional[str] = "user"
    locked: Optional[bool] = False
    criado_em: datetime
    
    class Config:
        from_attributes = True

class TreinoDetalheResponse(TreinoResponse):
    exercicios: List[dict] = []

# Treino Atribuido
class TreinoAtribuidoResponse(BaseModel):
    id: int
    treino_id: int
    aluno_id: int
    data_atribuicao: date
    ativo: bool
    observacao: Optional[str]
    
    class Config:
        from_attributes = True

# Serie Executada Schemas
class SerieExecutadaCreate(BaseModel):
    exercicio_id: int
    serie_num: int
    repeticoes: int
    carga_kg: Optional[float] = 0.0
    observacao: Optional[str] = None

class SerieExecutadaResponse(BaseModel):
    id: int
    aluno_id: int
    exercicio_id: int
    data_execucao: datetime
    serie_num: int
    repeticoes: int
    carga_kg: float
    
    class Config:
        from_attributes = True

# Desafio Schemas
class DesafioCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str = "custom"
    alvo_valor: Optional[float] = None

class DesafioResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str]
    tipo: str
    alvo_valor: Optional[float]
    ativo: bool
    
    class Config:
        from_attributes = True

class UsuarioDesafioResponse(BaseModel):
    id: int
    usuario_id: int
    desafio_id: int
    progresso: float
    concluido: bool
    data_inicio: date
    data_conclusao: Optional[datetime]
    
    class Config:
        from_attributes = True

# Badge Schemas
class BadgeResponse(BaseModel):
    id: int
    codigo: str
    nome: str
    descricao: Optional[str]
    icone_url: Optional[str]
    
    class Config:
        from_attributes = True

# Amizade Schemas
class AmizadeCreate(BaseModel):
    solicitado_id: int

class AmizadeResponse(BaseModel):
    id: int
    solicitante_id: int
    solicitado_id: int
    status: str
    criado_em: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schema
class DashboardResponse(BaseModel):
    usuario: UsuarioResponse
    streak_atual: int
    xp_total: int = 0
    nivel: int = 1
    moedas: int = 0
    titulo_atual: Optional[str] = None
    ultimos_treinos: List[dict]
    badges_recentes: List[BadgeResponse]
    proximos_desafios: List[dict]

# Analytics Schema
class AnalyticsResponse(BaseModel):
    volume_total: float
    frequencia_semanal: int
    progressao_ultimos_30_dias: dict
    distribuicao_muscular: dict
    exercicios_favoritos: List[dict]

# Medidas Corporais
class MedidaCorporalCreate(BaseModel):
    peso_kg: Optional[float] = None
    braco_cm: Optional[float] = None
    cintura_cm: Optional[float] = None
    abdomen_cm: Optional[float] = None
    peito_cm: Optional[float] = None
    gordura_percent: Optional[float] = None

class MedidaCorporalResponse(BaseModel):
    id: int
    aluno_id: int
    data_medida: date
    peso_kg: Optional[float]
    braco_cm: Optional[float]
    cintura_cm: Optional[float]
    abdomen_cm: Optional[float]
    peito_cm: Optional[float]
    gordura_percent: Optional[float]
    
    class Config:
        from_attributes = True
