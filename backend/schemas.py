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

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    perfil: str

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    nickname: Optional[str] = None
    email: str
    perfil: str
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

# Exercicio Schemas
class ExercicioCreate(BaseModel):
    nome: str
    grupo_muscular: Optional[str] = None
    descricao: Optional[str] = None

class ExercicioResponse(BaseModel):
    id: int
    nome: str
    grupo_muscular: Optional[str]
    descricao: Optional[str]
    
    class Config:
        from_attributes = True

# Treino Schemas
class TreinoExercicioCreate(BaseModel):
    exercicio_id: int
    ordem: int
    series_sugeridas: Optional[str] = None
    reps_sugeridas: Optional[str] = None

class TreinoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    duracao: Optional[int] = 45
    exercicios: List[TreinoExercicioCreate] = []

class TreinoResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    duracao: Optional[int] = 45
    criado_por: Optional[int]
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
