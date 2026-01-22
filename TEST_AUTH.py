#!/usr/bin/env python3
"""
Script para testar autenticação do FITDATA
"""
import json
import sys

# Teste manualmente sem requests
print("=" * 70)
print("TESTE DE AUTENTICAÇÃO - FITDATA")
print("=" * 70)
print()

# Instruções
print("📋 CREDENCIAIS DE TESTE:")
print()
print("  ADMIN:")
print("    Email: admin@fitdata.com")
print("    Senha: Admin@123")
print()
print("  USUÁRIO:")
print("    Email: usuario@fitdata.com")
print("    Senha: Usuario@123")
print()
print("=" * 70)
print()

print("✅ Para testar, acesse: http://localhost:5173")
print()
print("1️⃣  Clique em 'Entrar'")
print("2️⃣  Digite as credenciais acima")
print("3️⃣  Clique em 'Entrar'")
print()
print("Se receber erro 401, o problema está na autenticação JWT.")
print()
print("=" * 70)
