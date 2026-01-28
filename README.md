# 🏋️ Datafit - Gerenciamento de Academia

> Sistema integrado de treinos, saúde e gestão de alunos com gamificação e análises avançadas

## 📋 Status do Projeto

**Estado**: Em desenvolvimento ✅ **Funcional**

**Branch Atual**: `copilot/conventional-donkey`

### ✅ Implementado

#### Backend (FastAPI)
- ✅ Autenticação com JWT (login, registro, tokens)
- ✅ CRUD completo de Treinos e Exercícios
- ✅ Registro de execução de treinos (séries, cargas, repetições)
- ✅ Histórico de treinos com filtros por período
- ✅ Sistema de Amigos (adicionar, listar, solicitações pendentes)
- ✅ Sistema de Desafios e Streaks
- ✅ Badges (conquistas/troféus)
- ✅ Medidas Corporais e evolução física
- ✅ Dashboard com dados do usuário
- ✅ Analytics e gráficos de progresso
- ✅ CORS configurado para desenvolvimento
- ✅ Health check endpoints (`/health`)
- ✅ Seed data para testes

#### Frontend (React + Vite)
- ✅ Landing Page com navegação
- ✅ Sistema de Login/Registro
- ✅ Dashboard principal
- ✅ Gerenciamento de Treinos
- ✅ Execução de Treinos (ExecucaoPage)
- ✅ Histórico de Treinos
- ✅ Sistema de Amigos
- ✅ Desafios e Badges
- ✅ Analytics com visualizações
- ✅ Perfil do usuário
- ✅ Configurações
- ✅ Tema claro/escuro
- ✅ Toast notifications
- ✅ Loading spinners
- ✅ Componentes reutilizáveis
- ✅ Proxy API configurado

#### Infraestrutura
- ✅ Banco de dados MySQL com modelos relacionais
- ✅ SQLAlchemy ORM com migrations
- ✅ Variáveis de ambiente (.env)
- ✅ Docker-ready
- ✅ GitHub Codespace compatible

### 🚀 Como Rodar

#### Pré-requisitos
- Python 3.8+
- Node.js 16+
- MySQL (ou use SQLite para dev)

#### Backend
```bash
cd backend
pip install -r requirements.txt
# Seed database (opcional)
python seed.py
# Rodar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Acessar em http://localhost:5173
```

#### GitHub Codespace
```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🏗️ Arquitetura

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── context/        # Context API (Auth, Theme)
│   ├── services/       # API integration
│   └── styles/         # Tailwind CSS
└── vite.config.js      # Proxy configurado para /api

backend/
├── main.py             # FastAPI app
├── models.py           # SQLAlchemy models
├── database.py         # Database setup
├── routes/             # API endpoints
│   ├── auth.py         # Autenticação
│   ├── treinos.py      # Treinos
│   ├── execucao.py     # Execução de treinos
│   ├── desafios.py     # Desafios
│   ├── amigos.py       # Sistema social
│   ├── badges.py       # Conquistas
│   ├── analytics.py    # Analytics
│   └── ...
└── requirements.txt
```

## 🔐 Tecnologias

**Backend**:
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- Python-jose (JWT)
- Passlib + Bcrypt (Segurança)
- Pydantic 2.5.0

**Frontend**:
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animações)
- Lucide Icons
- Axios

**Banco de Dados**:
- MySQL (produção)
- SQLite (desenvolvimento)

**DevOps**:
- GitHub Codespace
- Docker-ready

## 📝 Funcionalidades Principais

### 1️⃣ Autenticação
- Cadastro e login com validação
- JWT tokens com expiração
- Proteção de rotas
- Recuperação de sessão

### 2️⃣ Treinos
- Criar/editar/deletar treinos
- Associar exercícios com cargas
- Histórico completo de execuções
- Acompanhamento de progresso

### 3️⃣ Gamificação
- Sistema de badges/troféus
- Desafios com leaderboard
- Streaks (sequência de dias)
- Pontos e recompensas

### 4️⃣ Social
- Sistema de amigos
- Comparação de progresso
- Desafios entre amigos
- Notificações

### 5️⃣ Analytics
- Gráficos de progresso
- Medidas corporais
- Dashboard com KPIs
- Relatórios por período

## 🔧 Configuração

### Variáveis de Ambiente

**Backend (.env)**:
```env
FRONTEND_URL=http://10.0.1.169:5173,https://seu-dominio.com
SECRET_KEY=sua-chave-secreta
ALGORITHM=HS256
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/fitdata
```

**Frontend (.env)**:
```env
VITE_API_URL=/api
```

## 📊 Próximos Passos

- [ ] Testes unitários (backend)
- [ ] Testes E2E (frontend)
- [ ] Deploy em produção
- [ ] App mobile (Flutter)
- [ ] Notificações push
- [ ] Exportar relatórios (PDF)
- [ ] Integração com wearables

## 👨‍💻 Desenvolvimento

**Branch**: `copilot/conventional-donkey`

**Commits recentes**:
- ✅ Fix: configure API proxy and CORS for GitHub Codespace

---

**Desenvolvido com ❤️ para academia e fitness**
