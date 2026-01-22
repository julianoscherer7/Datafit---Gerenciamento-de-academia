# 🎨 PROMPT PARA DESENVOLVIMENTO DO FRONTEND - FITDATA

## 📌 CONTEXTO DO PROJETO

Estou desenvolvendo **FITDATA**, um sistema completo de acompanhamento de treinos com foco em academia, progresso físico, gamificação e social.

**STATUS:** Backend 100% funcional em Python + FastAPI ✅

**OBJETIVO:** Criar frontend moderno, responsivo e com muitas animações para consumir os endpoints da API.

---

## 🎯 STACK RECOMENDADA

**Use a que achar melhor:**
- **React + Vite + Tailwind CSS** ⭐ (Recomendado - melhor performance + animações)
- **Vue 3 + Vite + Tailwind CSS** (Alternativa)
- **Next.js + Tailwind CSS** (Se quiser SSR)
- **Svelte + Tailwind CSS** (Se preferir algo mais leve)

**Animações:**
- Framer Motion (React) ou Motion (Vue/Svelte)
- Aos (Animate On Scroll)
- Tailwind CSS animations
- Lottie animations (para gráficos, badges, etc)

---

## 🔌 ENDPOINTS DA API (Backend)

### 🔐 AUTENTICAÇÃO
```
POST   /auth/register           - Registra novo usuário
POST   /auth/login             - Faz login
GET    /auth/me                - Obter info do usuário autenticado
```

### 🏠 DASHBOARD
```
GET    /dashboard              - Resumo geral (streak, últimos treinos, badges)
```

### 🏋️ MEUS TREINOS
```
GET    /treinos                - Lista treinos atribuídos
GET    /treinos/{id}           - Detalhes de um treino
POST   /execucao/{aluno_id}    - Registra execução de série
GET    /execucao/{aluno_id}/historico - Histórico de séries
```

### 🧠 DESAFIOS
```
GET    /desafios               - Lista desafios disponíveis
GET    /desafios/usuario/{id}  - Desafios do usuário
POST   /desafios/participar/{id} - Participar de desafio
POST   /desafios/progresso/{id} - Atualizar progresso
```

### 🤝 AMIGOS
```
GET    /amigos                 - Lista amigos
GET    /amigos/pendentes       - Solicitações pendentes
POST   /amigos/solicitar       - Solicitar amizade
POST   /amigos/aceitar/{id}    - Aceitar solicitação
POST   /amigos/rejeitar/{id}   - Rejeitar solicitação
GET    /amigos/feed            - Feed de atividades dos amigos
```

### 🏅 BADGES
```
GET    /badges                 - Todas as badges
GET    /badges/usuario/{id}    - Badges de um usuário
GET    /badges/meus            - Minhas badges
```

### 📜 HISTÓRICO
```
GET    /historico/{usuario_id}         - Histórico completo
GET    /historico/{usuario_id}/resumo-por-dia - Resumo por dia
```

### 📊 ANALYTICS
```
GET    /analytics/{usuario_id}         - Dados para gráficos
GET    /analytics/{usuario_id}/comparativo - Comparativo semanal
```

### ⚙️ CONFIGURAÇÕES
```
GET    /configs                        - Obter configurações
PUT    /configs                        - Atualizar configurações
```

### 🏃 EXERCÍCIOS
```
GET    /exercicios                     - Lista exercícios
GET    /exercicios/{id}                - Detalhes exercício
GET    /exercicios/grupos/listagem     - Grupos musculares
```

---

## 🎨 TELAS NECESSÁRIAS (COM ANIMAÇÕES)

### 1️⃣ **LANDING PAGE**
- Hero section com animação de entrada (fade + slide)
- Showcase dos recursos com scroll animation
- Call-to-action para login/registro
- Números animados (contador)

### 2️⃣ **AUTENTICAÇÃO (Login/Registro)**
- Telas com transição suave
- Validação em tempo real com feedback visual
- Input fields com animação de label
- Botão de submit com loading animation
- Mensagens de erro com shake animation
- Link para trocar entre login/registro com slide

### 3️⃣ **DASHBOARD**
- Card com streak animado (número crescente)
- Últimos treinos em card com hover effect
- Grid de badges recentes com pop animation
- Próximos desafios com progress bar animada
- Estatísticas com números que contam do 0 até o valor

### 4️⃣ **MEUS TREINOS**
- Lista de treinos com card hover
- Botão "Iniciar" que abre modal animado
- Dentro do modal: exercícios com acordeon expand/collapse
- Para cada exercício: inputs para série, reps, carga
- Botão "Registrar série" com confirmação visual
- Histórico de execuções em tabela com animação de linha

### 5️⃣ **DESAFIOS**
- Grid de desafios disponíveis
- Card com progress bar animada
- Badge "Completo!" com confete animation quando completar
- Histórico de desafios completados
- Modal para participar de desafio

### 6️⃣ **AMIGOS**
- Abas: "Meus Amigos" | "Solicitações" | "Sugestões"
- Cards de usuários com foto (avatar)
- Botões: Adicionar, Aceitar, Rejeitar com animação
- Feed de atividades dos amigos com entrada fade
- Notificação quando recebe solicitação (toast)

### 7️⃣ **BADGES**
- Galeria de badges com hover zoom
- Mostra data de quando ganhou
- Filtro por tipo com transição suave
- Modal com detalhes da badge

### 8️⃣ **HISTÓRICO**
- Tabela de séries executadas com filtro por exercício
- Gráfico de volume ao longo do tempo (Recharts/Chart.js)
- Resumo por dia em card
- Filtro por período com calendário

### 9️⃣ **ANALYTICS**
- Gráficos animados (Chart.js / Recharts):
  - Volume total (barra)
  - Frequência semanal (linha)
  - Distribuição muscular (pizza/radar)
  - Progressão de carga
- Números grandes com animação de contagem
- Comparativo semana por semana com animação

### 🔟 **CONFIGURAÇÕES**
- Form para editar nome
- Form para mudar senha
- Preferências (tema, notificações)
- Botão logout com confirmação
- Todos os inputs com validação visual

### 1️⃣1️⃣ **PERFIL DO USUÁRIO**
- Avatar do usuário
- Informações básicas
- Estatísticas rápidas
- Link para editar

### 1️⃣2️⃣ **NAVBAR/SIDEBAR**
- Menu responsivo (hambúrguer em mobile)
- Logo com animação
- Links com active state
- Dropdown para perfil
- Notificações com badge de contagem

---

## 🎬 ANIMAÇÕES ESPECÍFICAS RECOMENDADAS

| Elemento | Animação | Biblioteca |
|----------|----------|-----------|
| **Entrada de telas** | Fade + Slide | Framer Motion |
| **Cards** | Hover lift + shadow | Tailwind |
| **Números** | Contagem do 0 até valor | react-counter-js / Framer Motion |
| **Progress bars** | Animação linear/easing | Tailwind transitions |
| **Badges ganhas** | Pop + confete | Canvas-confetti |
| **Gráficos** | Animação de entrada | Recharts (built-in) |
| **Botões** | Pulse, ripple effect | Tailwind / custom CSS |
| **Modais** | Fade background + scale content | Framer Motion |
| **Toasts** | Slide in/out | react-hot-toast |
| **Listas** | Stagger animation | Framer Motion |
| **Scroll** | Fade + translate | AOS.js |

---

## 🛠️ ESTRUTURA DE PASTAS SUGERIDA

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   ├── Toast.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TreinosPage.jsx
│   │   ├── DesafiosPage.jsx
│   │   ├── AmigosPage.jsx
│   │   ├── BadgesPage.jsx
│   │   ├── HistoricoPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── ConfigsPage.jsx
│   │   └── PerfilPage.jsx
│   ├── services/
│   │   └── api.js (axios config + endpoints)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useLocalStorage.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── package.json
└── vite.config.js
```

---

## 📝 ARQUITETURA & INTEGRAÇÃO

### **API Service (api.js)**
```javascript
// Exemplo de como estruturar as chamadas
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const dashboardAPI = {
  get: () => api.get('/dashboard')
};

// ... etc para todas as rotas
```

### **Auth Context**
- Armazenar token no localStorage
- Gerenciar estado de autenticação
- Atualizar token automaticamente
- Logout limpa dados

### **Custom Hooks**
- `useAuth()` - contexto de autenticação
- `useFetch(url)` - chamadas HTTP com loading/error
- `useLocalStorage(key)` - persistência

---

## 🎨 DESIGN GUIDELINES

- **Tema:** Dark/Light toggle
- **Cores primárias:** Verde (success), Azul (info), Vermelho (error), Amarelo (warning)
- **Tipografia:** Fonte moderna (Inter, Poppins, ou Geist)
- **Spacing:** Sistema 4px (4, 8, 12, 16, 20, 24, 32, etc)
- **Breakpoints:** Mobile (320px), Tablet (768px), Desktop (1024px), Large (1280px)
- **Ícones:** React Icons ou Heroicons
- **Responsividade:** Mobile first

---

## ✨ REQUISITOS ESPECÍFICOS

✅ **Deve ter:**
- Animações suaves em todas as interações
- Loading states claros
- Mensagens de erro informativas
- Feedback visual imediato
- Responsividade completa
- Acessibilidade (ARIA labels, keyboard navigation)
- Modo claro e escuro
- Performance otimizada (lazy loading, code splitting)
- PWA ready (manifest.json, service worker)

✅ **Performance:**
- Lighthouse score mínimo 90
- Carregamento da tela em < 2s
- Animações @ 60fps
- Bundle size < 200KB (gzipped)

---

## 🚀 INSTRUÇÕES FINAIS

1. **Combine com o Backend:** Use os endpoints mencionados acima
2. **Animações:** Não seja tímido! Animar transições, hover, cliques, scroll
3. **Responsividade:** Funcione perfeitamente em Mobile, Tablet e Desktop
4. **Estado:** Gerencie estado com Context API ou Zustand
5. **Código limpo:** Componentes reutilizáveis, bem organizados
6. **Documentação:** README com instruções de setup

---

## 💡 DICA IMPORTANTE

O backend está rodando em `http://localhost:8000` com CORS habilitado.

Configure seu `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

Acesse documentação interativa em: `http://localhost:8000/docs`

---

## 🎯 RESULTADO ESPERADO

Uma interface **moderna, rápida, responsiva e visualmente impressionante** que:
- ✨ Deleia o usuário com animações suaves
- 📱 Funcione perfeitamente em qualquer dispositivo
- ⚡ Seja rápida e reativa
- 🎨 Tenha design consistente e profissional
- 🔄 Sincronize perfeitamente com a API

**BOA SORTE! 🚀**
