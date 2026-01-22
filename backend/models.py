from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Enum, ForeignKey, Numeric, Boolean, JSON, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from database import Base
from datetime import datetime, date

# Usuarios
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    senha_hash = Column(String(256), nullable=False)
    perfil = Column(Enum("aluno", "instrutor", "admin"), default="aluno", nullable=False)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, onupdate=func.now())

# Exercicios
class Exercicio(Base):
    __tablename__ = "exercicios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    grupo_muscular = Column(String(80), index=True)
    descricao = Column(Text)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, onupdate=func.now())

# Treinos
class Treino(Base):
    __tablename__ = "treinos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text)
    criado_por = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"))
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
