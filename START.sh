#!/bin/bash

# Script para iniciar FITDATA com todas as configurações

echo "🚀 INICIANDO FITDATA..."
echo ""

# Carrega variáveis de ambiente a partir de .env (se presentes)
# Procura em: ./ .env, backend/.env, frontend/.env
if [ -f .env ]; then
	set -o allexport; source .env; set +o allexport
fi
if [ -f backend/.env ]; then
	set -o allexport; source backend/.env; set +o allexport
fi
if [ -f frontend/.env ]; then
	set -o allexport; source frontend/.env; set +o allexport
fi

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Configuração do Sistema${NC}"
echo "=================================="
echo ""

echo -e "${GREEN}✅ Backend (FastAPI)${NC}"
if [ -n "${VITE_API_URL}" ]; then
	echo "   URL: ${VITE_API_URL}"
	echo "   Docs: ${VITE_API_URL}/docs"
else
	echo "   URL: <VITE_API_URL not set; configure frontend/.env with VITE_API_URL>"
	echo "   Docs: <VITE_API_URL not set>"
fi
echo "   Status: Rodando"
echo ""

echo -e "${GREEN}✅ Frontend (React + Vite)${NC}"
if [ -n "${FRONTEND_URL}" ]; then
	echo "   URL: ${FRONTEND_URL}"
else
	echo "   URL: <FRONTEND_URL not set; configure backend/.env with FRONTEND_URL>"
fi
echo "   Status: Rodando"
echo ""

echo -e "${BLUE}👤 Credenciais de Teste${NC}"
echo "=================================="
echo ""

echo -e "${YELLOW}ADMIN${NC}"
echo "   Email: admin@fitdata.com"
echo "   Senha: Admin@123"
echo "   Permissões: Todas"
echo ""

echo -e "${YELLOW}USUÁRIO PADRÃO${NC}"
echo "   Email: usuario@fitdata.com"
echo "   Senha: Usuario@123"
echo "   Perfil: Aluno"
echo ""

echo -e "${BLUE}✨ Funcionalidades Novas${NC}"
echo "=================================="
echo ""
echo "   ✅ Validação de senha (6+ chars, 1+ número)"
echo "   ✅ Confirmação de senha no registro"
echo "   ✅ Dark mode toggle (🌙)"
echo "   ✅ Botão home (🏠)"
echo "   ✅ Layout responsivo"
echo "   ✅ Animações suaves"
echo "   ✅ Mensagens de erro detalhadas"
echo ""

echo -e "${BLUE}🔗 Links Úteis${NC}"
echo "=================================="
echo ""
if [ -n "${FRONTEND_URL}" ]; then
	echo "   App: ${FRONTEND_URL}"
else
	echo "   App: <FRONTEND_URL not set>"
fi
if [ -n "${VITE_API_URL}" ]; then
	echo "   API Docs: ${VITE_API_URL}/docs"
else
	echo "   API Docs: <VITE_API_URL not set>"
fi
echo "   GitHub: https://github.com/julianoscherer7/Datafit---Gerenciamento-de-academia"
echo ""

echo -e "${BLUE}🛠️ Para Recriar os Usuários${NC}"
echo "=================================="
echo "   cd backend && python seed.py"
echo ""

echo "🎉 Pronto para testar!"
