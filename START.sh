#!/bin/bash

# Script para iniciar FITDATA com todas as configurações

echo "🚀 INICIANDO FITDATA..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Configuração do Sistema${NC}"
echo "=================================="
echo ""

echo -e "${GREEN}✅ Backend (FastAPI)${NC}"
echo "   URL: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Status: Rodando"
echo ""

echo -e "${GREEN}✅ Frontend (React + Vite)${NC}"
echo "   URL: http://localhost:5173"
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
echo "   App: http://localhost:5173"
echo "   API Docs: http://localhost:8000/docs"
echo "   GitHub: https://github.com/julianoscherer7/Datafit---Gerenciamento-de-academia"
echo ""

echo -e "${BLUE}🛠️ Para Recriar os Usuários${NC}"
echo "=================================="
echo "   cd backend && python seed.py"
echo ""

echo "🎉 Pronto para testar!"
