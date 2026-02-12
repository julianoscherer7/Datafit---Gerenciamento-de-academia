from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from database import engine, Base
from dotenv import load_dotenv

# Carrega variáveis de ambiente definidas em backend/.env durante desenvolvimento
load_dotenv()

# Importa todos os models para criar as tabelas
from models import (
    Usuario, Exercicio, Treino, TreinoExercicio, TreinoAtribuido,
    SerieExecutada, MedidaCorporal, Desafio, UsuarioDesafio, Streak,
    Badge, UsuarioBadge, Amizade, Notificacao, LeaderboardSemanal,
    Checkin, Story, StoryView, Mensagem, ItemLoja, ItemUsuario,
    UsuarioProgresso, Recompensa, CoachStudent, CoachInviteToken, PresenceValidation
)

# Importa os routers
from routes import auth, dashboard, treinos, execucao, desafios, amigos, badges, historico, analytics, configs, exercicios
from routes import checkin, stories, chat, loja
from routes import coach

# Cria a aplicação
app = FastAPI(
    title="FITDATA API",
    description="API completa para gerenciamento de academia com gamificação",
    version="1.0.0"
)

# Cria as tabelas se não existirem (ao iniciar a app)
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# Configura CORS - Permite todas as origens em desenvolvimento
# Em produção, defina FRONTEND_URL com as origens específicas
frontend_urls = os.getenv("FRONTEND_URL", "").strip()

# Detecta se está em ambiente Codespaces ou desenvolvimento
is_codespaces = "CODESPACES" in os.environ or "CODESPACE_NAME" in os.environ
is_dev = os.getenv("ENV", "development") != "production"

# Always allow all origins in development/codespaces to avoid CORS issues
origins = ["*"]
allow_credentials = False  # Cannot use credentials with "*"
print(f"[CORS] Allowing all origins (development mode)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Registra os routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(treinos.router)
app.include_router(execucao.router)
app.include_router(desafios.router)
app.include_router(amigos.router)
app.include_router(badges.router)
app.include_router(historico.router)
app.include_router(analytics.router)
app.include_router(configs.router)
app.include_router(exercicios.router)
app.include_router(checkin.router)
app.include_router(stories.router)
app.include_router(chat.router)
app.include_router(loja.router)
app.include_router(coach.router)


@app.get("/", tags=["root"])
def read_root():
    """Health check da API"""
    return {
        "message": "FITDATA API v1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health", tags=["root"])
def health():
    """Health check detalhado"""
    return {
        "status": "healthy",
        "database": "connected",
        "cors": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
