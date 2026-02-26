# DATAFIT Mobile — Guia de Desenvolvimento

## Pré-requisitos

| Item | Versão mínima |
|------|---------------|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI (`npx expo`) | SDK 52 |
| Expo Go (iPhone/Android) | versão compatível com SDK 52 |

---

## 1. Configurar o backend

O app mobile consome a **API REST do DATAFIT** (FastAPI). O backend precisa estar acessível pelo celular.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

> O `--host 0.0.0.0` garante que o backend aceite conexões de qualquer IP, não apenas localhost.

---

## 2. Expor o backend para o celular

### Opção A — Mesma rede local (Wi-Fi de casa)

Descubra o IP da máquina:

```bash
# Linux / macOS
ip addr | grep inet
# ou
hostname -I
```

Use o IP (ex: `192.168.0.100`) no `.env` do mobile:

```
EXPO_PUBLIC_API_URL=http://192.168.0.100:8000
```

### Opção B — Rede restrita (SENAC, universidade, coworking)

Redes corporativas geralmente **bloqueiam** tráfego entre dispositivos. Use um **tunnel** para expor o backend:

```bash
# Instalar ngrok (uma vez)
npm install -g ngrok
# ou: brew install ngrok  (macOS)
# ou: snap install ngrok  (Linux)

# Expor a porta 8000
ngrok http 8000
```

Copie a URL HTTPS que o ngrok gerar (ex: `https://abc123.ngrok-free.app`) e cole no `.env`:

```
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

> **Importante:** a URL do ngrok muda a cada reinício (plano gratuito). Atualize o `.env` e reinicie o Expo quando isso acontecer.

---

## 3. Configurar o mobile

```bash
cd mobile

# Instalar dependências
npm install

# Instalar @expo/ngrok (necessário para expo tunnel)
npx expo install @expo/ngrok

# Criar .env a partir do exemplo
cp .env.example .env
```

Edite `mobile/.env` e preencha `EXPO_PUBLIC_API_URL` com a URL obtida no passo 2.

---

## 4. Rodar o app

```bash
# Dentro de mobile/
npx expo start --tunnel
```

1. O terminal vai exibir um **QR code**.
2. No iPhone, abra o app **Expo Go**.
3. Escaneie o QR code com a câmera do iPhone.
4. O app vai carregar e conectar na API!

> Se o QR não abrir automaticamente, copie o link `exp://...` que aparece no terminal e cole no Safari do iPhone.

---

## 5. Diagnóstico rápido

| Problema | Solução |
|----------|---------|
| `API_BASE_URL → (vazio)` no console | Verifique se o `.env` existe e se reiniciou o Expo (`npx expo start --tunnel --clear`) |
| `Network Error` no login | Backend não está acessível. Confira se ngrok está rodando e se a URL no `.env` está correta |
| `401 Unauthorized` | Token expirado. Faça logout e login novamente |
| QR code não funciona | Verifique se `@expo/ngrok` está instalado (`npx expo install @expo/ngrok`) |
| App não carrega / crash | Limpe cache: `npx expo start --tunnel --clear` |

---

## Estrutura dos arquivos de rede

```
mobile/
├── .env                          # URL da API (NÃO commitado)
├── .env.example                  # Modelo para novos devs
├── src/
│   ├── config/
│   │   └── api.ts                # Lê EXPO_PUBLIC_API_URL, valida, exporta
│   ├── api/
│   │   ├── client.ts             # Instância Axios + interceptors JWT + erros
│   │   └── index.ts              # Barrel export
│   └── services/
│       ├── authStorage.ts        # Helpers SecureStore (saveToken, getToken, removeToken)
│       ├── auth.service.ts       # Endpoints de autenticação
│       └── ...                   # Outros services
```

---

## Fluxo de autenticação

```
iPhone (Expo Go)
      │
      ▼
  Login screen
      │  POST /auth/login  (username + password)
      ▼
  API retorna { access_token }
      │
      ▼
  saveToken(token)  →  expo-secure-store (Keychain iOS)
      │
      ▼
  Todas as requisições seguintes incluem
  header: Authorization: Bearer <token>
      │
      ▼
  Se 401 → removeToken() → redireciona p/ login
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `EXPO_PUBLIC_API_URL` | ✅ | URL completa do backend (sem barra final) |

**Regras:**
- NUNCA usar `localhost` ou `127.0.0.1`
- Sempre incluir protocolo (`http://` ou `https://`)
- Sem barra final (`/`) na URL
- Alterar **apenas** o `.env` — sem mexer no código

---

## Comandos úteis

```bash
# Iniciar com tunnel (recomendado no SENAC)
npx expo start --tunnel

# Iniciar em rede local (Wi-Fi de casa)
npx expo start

# Limpar cache do bundler
npx expo start --tunnel --clear

# Ver IP da máquina
hostname -I

# Testar se o backend responde
curl http://SEU_IP:8000/docs
```
