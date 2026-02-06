from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum, ForeignKey, Numeric, Boolean, JSON, Index, UniqueConstraint, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from database import Base
from datetime import datetime, date

# Usuarios
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    nickname = Column(String(30), unique=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    senha_hash = Column(String(256), nullable=False)
    perfil = Column(Enum("aluno", "instrutor", "admin"), default="aluno", nullable=False)
    
    # === COACH FIELDS ===
    coach_status = Column(Enum("pending", "approved", "rejected"), nullable=True)  # Only for perfil=instrutor
    cref = Column(String(20), nullable=True)  # CREF number for coaches
    especialidade = Column(String(150), nullable=True)  # Coach specialty
    documento_url = Column(String(500), nullable=True)  # Verification document URL
    documento_base64 = Column(Text, nullable=True)  # Verification document base64
    coach_bio = Column(Text, nullable=True)  # Professional bio for coaches
    
    # Campos de perfil estendido
    foto_url = Column(String(500))
    foto_base64 = Column(Text)
    banner_base64 = Column(Text)  # Profile banner
    bio = Column(Text)
    data_nascimento = Column(Date)
    peso_kg = Column(Numeric(5, 2))
    altura_cm = Column(Numeric(5, 1))
    genero = Column(String(20))
    
    # Redes sociais
    instagram = Column(String(100))
    tiktok = Column(String(100))
    twitter = Column(String(100))
    linkedin = Column(String(100))
    
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, onupdate=func.now())
    
    # Relationships
    coach_connections = relationship("CoachStudent", foreign_keys="CoachStudent.coach_id", back_populates="coach")
    student_connections = relationship("CoachStudent", foreign_keys="CoachStudent.student_id", back_populates="student")

# Exercicios
class Exercicio(Base):
    __tablename__ = "exercicios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    grupo_muscular = Column(String(80), index=True)
    descricao = Column(Text)
    # Tutorial fields
    instrucoes = Column(Text, nullable=True)  # Step-by-step instructions
    dicas = Column(Text, nullable=True)  # Tips for proper form
    musculos_trabalhados = Column(String(300), nullable=True)  # Comma-separated muscles
    nivel = Column(Enum("iniciante", "intermediario", "avancado"), default="iniciante")
    equipamento = Column(String(150), nullable=True)  # Equipment needed
    video_url = Column(String(500), nullable=True)  # Tutorial video URL
    imagem_url = Column(String(500), nullable=True)  # Exercise illustration
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, onupdate=func.now())

# === COACH-STUDENT CONNECTION ===
class CoachStudent(Base):
    __tablename__ = "coach_students"
    
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum("pending", "active", "rejected", "removed"), default="pending", nullable=False)
    connected_at = Column(DateTime, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
    
    coach = relationship("Usuario", foreign_keys=[coach_id], back_populates="coach_connections")
    student = relationship("Usuario", foreign_keys=[student_id], back_populates="student_connections")
    
    __table_args__ = (UniqueConstraint("coach_id", "student_id"),)

# === COACH INVITE TOKENS ===
class CoachInviteToken(Base):
    __tablename__ = "coach_invite_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    max_uses = Column(Integer, default=1)
    uses = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())

# === PRESENCE VALIDATION LOG ===
class PresenceValidation(Base):
    __tablename__ = "presence_validations"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id", ondelete="SET NULL"), nullable=True, index=True)
    foto_base64 = Column(Text, nullable=True)
    validated = Column(Boolean, default=True)
    method = Column(String(30), default="selfie")  # selfie, manual
    criado_em = Column(DateTime, server_default=func.now())

# Treinos
class Treino(Base):
    __tablename__ = "treinos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text)
    duracao = Column(Integer, default=45)  # Duração em minutos
    criado_por = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"))
    origem = Column(Enum("user", "coach", "ai"), default="user")  # Who created: user, coach, or AI
    locked = Column(Boolean, default=False)  # Coach-locked training (student can't edit)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, onupdate=func.now())

# Treino_Exercicios
class TreinoExercicio(Base):
    __tablename__ = "treino_exercicios"
    
    id = Column(Integer, primary_key=True, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    ordem = Column(Integer, default=1)
    series_sugeridas = Column(String(50))
    reps_sugeridas = Column(String(50))

# Treinos_Atribuidos
class TreinoAtribuido(Base):
    __tablename__ = "treinos_atribuidos"
    
    id = Column(Integer, primary_key=True, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    aluno_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    data_atribuicao = Column(Date)
    ativo = Column(Boolean, default=True)
    observacao = Column(String(255))

# Series_Executadas
class SerieExecutada(Base):
    __tablename__ = "series_executadas"
    
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id", ondelete="SET NULL", onupdate="CASCADE"), index=True)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    data_execucao = Column(DateTime, server_default=func.now(), index=True)
    serie_num = Column(Integer, default=1)
    repeticoes = Column(Integer, nullable=False)
    carga_kg = Column(Numeric(6, 2), default=0.00)
    observacao = Column(Text)

# Medidas_Corporais
class MedidaCorporal(Base):
    __tablename__ = "medidas_corporais"
    
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    data_medida = Column(Date, index=True)
    peso_kg = Column(Numeric(6, 2))
    braco_cm = Column(Numeric(6, 2))
    cintura_cm = Column(Numeric(6, 2))
    abdomen_cm = Column(Numeric(6, 2))
    peito_cm = Column(Numeric(6, 2))
    gordura_percent = Column(Numeric(5, 2))
    foto_url = Column(String(255))
    criado_em = Column(DateTime, server_default=func.now())

# Desafios
class Desafio(Base):
    __tablename__ = "desafios"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text)
    tipo = Column(Enum("series", "tempo", "volume", "custom"), default="custom")
    alvo_valor = Column(Numeric(10, 2))
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())

# Usuario_Desafios
class UsuarioDesafio(Base):
    __tablename__ = "usuario_desafios"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    desafio_id = Column(Integer, ForeignKey("desafios.id", ondelete="CASCADE"), nullable=False, index=True)
    data_inicio = Column(Date)
    data_conclusao = Column(DateTime)
    progresso = Column(Numeric(10, 2), default=0)
    concluido = Column(Boolean, default=False, index=True)

# Streaks
class Streak(Base):
    __tablename__ = "streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True)
    inicio = Column(Date, nullable=False)
    atual = Column(Integer, default=0)
    ultimo_dia = Column(Date)

# Badges
class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(80), unique=True, nullable=False)
    nome = Column(String(120), nullable=False)
    descricao = Column(Text)
    icone_url = Column(String(255))
    criado_em = Column(DateTime, server_default=func.now())

# Usuario_Badges
class UsuarioBadge(Base):
    __tablename__ = "usuario_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    adquirido_em = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("usuario_id", "badge_id"),)

# Amizades
class Amizade(Base):
    __tablename__ = "amizades"
    
    id = Column(Integer, primary_key=True, index=True)
    solicitante_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    solicitado_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum("pendente", "aceito", "rejeitado"), default="pendente")
    criado_em = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("solicitante_id", "solicitado_id"),)

# Notificacoes
class Notificacao(Base):
    __tablename__ = "notificacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo = Column(String(80))
    titulo = Column(String(150))
    mensagem = Column(Text)
    lida = Column(Boolean, default=False, index=True)
    meta = Column(JSON)
    criado_em = Column(DateTime, server_default=func.now())

# Leaderboard_Semanal
class LeaderboardSemanal(Base):
    __tablename__ = "leaderboard_semanal"
    
    id = Column(Integer, primary_key=True, index=True)
    semana_ano = Column(String(20), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    pontos = Column(Integer, default=0)
    criterio = Column(String(50))
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    __table_args__ = (UniqueConstraint("semana_ano", "usuario_id", "criterio"),)

# Check-in de Treino (comprovação com foto)
class Checkin(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id", ondelete="SET NULL"), index=True)
    foto_url = Column(String(500))
    foto_base64 = Column(Text)  # Para armazenar foto em base64
    localizacao = Column(String(255))
    validado = Column(Boolean, default=False)
    pontos_ganhos = Column(Integer, default=10)
    criado_em = Column(DateTime, server_default=func.now())

# Stories (fotos com 24h de duração)
class Story(Base):
    __tablename__ = "stories"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo = Column(Enum("foto", "treino", "conquista"), default="foto")
    conteudo_url = Column(String(500))
    conteudo_base64 = Column(Text)
    texto = Column(String(280))  # Texto curto como Twitter
    emoji_reacoes = Column(JSON, default=dict)  # {"🔥": 5, "💪": 3}
    visualizacoes = Column(Integer, default=0)
    ativo = Column(Boolean, default=True)
    expira_em = Column(DateTime)  # 24h após criação
    criado_em = Column(DateTime, server_default=func.now())

# Visualizações de Stories
class StoryView(Base):
    __tablename__ = "story_views"
    
    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    visualizado_em = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("story_id", "usuario_id"),)

# Mensagens de Chat
class Mensagem(Base):
    __tablename__ = "mensagens"
    
    id = Column(Integer, primary_key=True, index=True)
    remetente_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    destinatario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    conteudo = Column(Text, nullable=False)
    tipo = Column(Enum("texto", "imagem", "treino", "badge"), default="texto")
    imagem_url = Column(String(500))
    imagem_base64 = Column(Text)
    lida = Column(Boolean, default=False)
    criado_em = Column(DateTime, server_default=func.now())

# Itens da Loja (Skins, Bordas, Temas)
class ItemLoja(Base):
    __tablename__ = "itens_loja"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(80), unique=True, nullable=False)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text)
    tipo = Column(Enum("skin", "borda", "tema", "titulo", "emoji"), default="skin")
    preco_moedas = Column(Integer, default=100)
    icone = Column(String(50))  # Emoji ou URL
    preview_url = Column(String(500))
    raridade = Column(Enum("comum", "raro", "epico", "lendario"), default="comum")
    disponivel = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())

# Itens Comprados pelo Usuário
class ItemUsuario(Base):
    __tablename__ = "itens_usuario"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("itens_loja.id", ondelete="CASCADE"), nullable=False)
    equipado = Column(Boolean, default=False)
    adquirido_em = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("usuario_id", "item_id"),)

# Moedas e XP do Usuário
class UsuarioProgresso(Base):
    __tablename__ = "usuario_progresso"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True)
    moedas = Column(Integer, default=0)
    xp_total = Column(Integer, default=0)
    nivel = Column(Integer, default=1)
    titulo_atual = Column(String(100), default="Iniciante")
    borda_atual = Column(String(80))
    tema_atual = Column(String(80), default="dark")
    treinos_validados = Column(Integer, default=0)
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

# Recompensas por Ação
class Recompensa(Base):
    __tablename__ = "recompensas"
    
    id = Column(Integer, primary_key=True, index=True)
    acao = Column(String(100), unique=True, nullable=False)  # "checkin", "treino_validado", "streak_7", etc.
    moedas = Column(Integer, default=0)
    xp = Column(Integer, default=0)
    descricao = Column(String(255))
    ativo = Column(Boolean, default=True)
