from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Importa todos os models para criar as tabelas
from models import (
    Usuario, Exercicio, Treino, TreinoExercicio, TreinoAtribuido,
    SerieExecutada, MedidaCorporal, Desafio, UsuarioDesafio, Streak,
    Badge, UsuarioBadge, Amizade, Notificacao, LeaderboardSemanal
)

# Importa os routers
from routes import auth, dashboard, treinos, execucao, desafios, amigos, badges, historico, analytics, configs, exercicios

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

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/", tags=["root"])
def read_root():
    """Health check da API"""
    return {
        "message": "FITDATA API v1.0.0",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
