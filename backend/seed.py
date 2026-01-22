"""
Script para popular o banco de dados com dados iniciais
Execute com: python seed.py
"""

from database import SessionLocal, Base, engine
from models import Usuario
from security import hash_password

def seed_database():
    """Cria usuários padrão no banco de dados"""
    
    # Cria as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verifica se já existem usuários
        admin_exists = db.query(Usuario).filter(Usuario.email == "admin@fitdata.com").first()
        user_exists = db.query(Usuario).filter(Usuario.email == "usuario@fitdata.com").first()
        
        if not admin_exists:
            admin = Usuario(
                nome="Administrador",
                email="admin@fitdata.com",
                senha_hash=hash_password("Admin@123"),
                perfil="admin"
            )
            db.add(admin)
            print("✅ Usuário admin criado: admin@fitdata.com / Admin@123")
        else:
            print("⚠️ Admin já existe")
        
        if not user_exists:
            user = Usuario(
                nome="Usuário Padrão",
                email="usuario@fitdata.com",
                senha_hash=hash_password("Usuario@123"),
                perfil="aluno"
            )
            db.add(user)
            print("✅ Usuário padrão criado: usuario@fitdata.com / Usuario@123")
        else:
            print("⚠️ Usuário padrão já existe")
        
        db.commit()
        print("\n✨ Banco de dados atualizado com sucesso!")
        print("\n📝 Credenciais de teste:")
        print("   Admin: admin@fitdata.com / Admin@123")
        print("   Usuário: usuario@fitdata.com / Usuario@123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao popular banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
