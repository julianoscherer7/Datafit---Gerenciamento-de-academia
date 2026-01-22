"""
Teste de autenticação - Execute para verificar se tudo está funcionando
"""
from datetime import timedelta
from backend.database import SessionLocal
from backend.models import Usuario
from backend.security import hash_password, create_access_token, decode_token
import json

def test_auth():
    print("=" * 70)
    print("TESTE DE AUTENTICAÇÃO JWT")
    print("=" * 70)
    print()
    
    db = SessionLocal()
    
    try:
        # Buscar admin
        admin = db.query(Usuario).filter(Usuario.email == "admin@fitdata.com").first()
        
        if not admin:
            print("❌ Admin não encontrado. Execute seed.py primeiro!")
            print()
            print("   cd backend && python seed.py")
            return
        
        print("✅ Admin encontrado:")
        print(f"   Email: {admin.email}")
        print(f"   Nome: {admin.nome}")
        print(f"   Perfil: {admin.perfil}")
        print()
        
        # Criar token
        access_token_expires = timedelta(minutes=60)
        token = create_access_token(
            data={"sub": str(admin.id), "perfil": admin.perfil},
            expires_delta=access_token_expires
        )
        
        print("✅ Token gerado com sucesso:")
        print(f"   {token[:50]}...")
        print()
        
        # Decodificar token
        payload = decode_token(token)
        print("✅ Token decodificado:")
        print(f"   sub (user_id): {payload.get('sub')}")
        print(f"   perfil: {payload.get('perfil')}")
        print(f"   exp (expira em): {payload.get('exp')}")
        print()
        
        print("=" * 70)
        print("✅ AUTENTICAÇÃO FUNCIONANDO CORRETAMENTE!")
        print("=" * 70)
        print()
        print("Próximos passos:")
        print("1. Acesse http://localhost:5173")
        print("2. Clique em 'Entrar'")
        print("3. Use as credenciais:")
        print("   Email: admin@fitdata.com")
        print("   Senha: Admin@123")
        print()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth()
