"""
Script para popular o banco de dados com dados iniciais
Execute com: python seed.py
"""

from database import SessionLocal, Base, engine
from models import (
    Usuario, Amizade, Badge, UsuarioProgresso, Desafio, 
    Exercicio, Treino, TreinoExercicio, TreinoAtribuido, 
    SerieExecutada, MedidaCorporal, UsuarioDesafio, UsuarioBadge, Streak
)
from security import hash_password
from datetime import date, datetime, timedelta
import random

def seed_database():
    """Cria usuários padrão e dados de teste no banco de dados"""
    
    # Cria as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # ==================== EXERCÍCIOS ====================
        
        exercicios_data = [
            ("Supino Reto", "peito", "Exercício básico para desenvolvimento peitoral"),
            ("Supino Inclinado", "peito", "Foco na porção superior do peitoral"),
            ("Crucifixo", "peito", "Isolamento do peitoral"),
            ("Agachamento Livre", "pernas", "Exercício composto para quadríceps e glúteos"),
            ("Leg Press", "pernas", "Exercício em máquina para pernas"),
            ("Extensora", "pernas", "Isolamento de quadríceps"),
            ("Flexora", "pernas", "Isolamento de posteriores"),
            ("Puxada Frontal", "costas", "Desenvolvimento da largura das costas"),
            ("Remada Curvada", "costas", "Espessura das costas"),
            ("Remada Baixa", "costas", "Costas médias e inferiores"),
            ("Desenvolvimento", "ombros", "Desenvolvimento de deltoides"),
            ("Elevação Lateral", "ombros", "Isolamento de deltoides laterais"),
            ("Rosca Direta", "bíceps", "Exercício básico para bíceps"),
            ("Rosca Martelo", "bíceps", "Bíceps e antebraços"),
            ("Tríceps Pulley", "tríceps", "Isolamento de tríceps"),
            ("Tríceps Testa", "tríceps", "Desenvolvimento completo do tríceps"),
            ("Abdominal Supra", "abdômen", "Exercício para reto abdominal"),
            ("Prancha", "abdômen", "Core estabilização"),
            ("Corrida Esteira", "cardio", "Cardio para queima calórica"),
            ("Bicicleta Ergométrica", "cardio", "Cardio de baixo impacto"),
        ]
        
        exercicios = {}
        for nome, grupo, desc in exercicios_data:
            exercicio = db.query(Exercicio).filter(Exercicio.nome == nome).first()
            if not exercicio:
                exercicio = Exercicio(nome=nome, grupo_muscular=grupo, descricao=desc)
                db.add(exercicio)
                db.commit()
                db.refresh(exercicio)
            exercicios[nome] = exercicio
        
        print("✅ Exercícios criados")
        
        # ==================== USUÁRIOS ====================
        
        # Admin
        admin = db.query(Usuario).filter(Usuario.email == "admin@fitdata.com").first()
        if not admin:
            admin = Usuario(
                nome="Administrador",
                email="admin@fitdata.com",
                senha_hash=hash_password("Admin@123"),
                perfil="admin",
                bio="Administrador do sistema FITDATA",
                instagram="@fitdata_admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Admin criado: admin@fitdata.com / Admin@123")
        else:
            print("⚠️ Admin já existe")
        
        # Usuário principal
        user = db.query(Usuario).filter(Usuario.email == "usuario@fitdata.com").first()
        if not user:
            user = Usuario(
                nome="João Silva",
                email="usuario@fitdata.com",
                senha_hash=hash_password("Usuario@123"),
                perfil="aluno",
                bio="🏋️ Fitness enthusiast | 💪 Treino pesado",
                data_nascimento=date(1995, 5, 15),
                peso_kg=75.5,
                altura_cm=178,
                genero="masculino",
                instagram="@joaosilva_fit",
                tiktok="@joaofit"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("✅ Usuário criado: usuario@fitdata.com / Usuario@123")
        else:
            print("⚠️ Usuário padrão já existe")
        
        # ==================== MARIA - CONTA DEMONSTRAÇÃO ====================
        # Conta completa com histórico rico para apresentação
        
        amigo1 = db.query(Usuario).filter(Usuario.email == "maria@fitdata.com").first()
        if not amigo1:
            amigo1 = Usuario(
                nome="Maria Santos",
                email="maria@fitdata.com",
                senha_hash=hash_password("Maria@123"),
                perfil="aluno",
                bio="🧘 Yoga | 🏃 Corrida | 🥗 Vida saudável\n💪 Foco em hipertrofia\n🎯 Meta: 5km em 25min",
                data_nascimento=date(1998, 8, 22),
                peso_kg=62.0,
                altura_cm=165,
                genero="feminino",
                instagram="@mariasantos_fit",
                twitter="@maria_fitness",
                tiktok="@mariafitlife"
            )
            db.add(amigo1)
            db.commit()
            db.refresh(amigo1)
            print("✅ Maria (conta demo) criada: maria@fitdata.com / Maria@123")
        else:
            print("⚠️ Maria já existe")
        
        # Amigo fictício 2
        amigo2 = db.query(Usuario).filter(Usuario.email == "pedro@fitdata.com").first()
        if not amigo2:
            amigo2 = Usuario(
                nome="Pedro Oliveira",
                email="pedro@fitdata.com",
                senha_hash=hash_password("Pedro@123"),
                perfil="aluno",
                bio="💪 Bodybuilding | 🎯 Foco total",
                data_nascimento=date(1992, 3, 10),
                peso_kg=85.0,
                altura_cm=182,
                genero="masculino",
                instagram="@pedro_strong",
                linkedin="pedro-oliveira-fit"
            )
            db.add(amigo2)
            db.commit()
            db.refresh(amigo2)
            print("✅ Amigo fictício 2 criado: pedro@fitdata.com / Pedro@123")
        else:
            print("⚠️ Pedro já existe")
        
        # ==================== TREINOS PARA MARIA ====================
        
        treinos_maria = [
            ("Treino A - Upper Body", "Foco em peito, costas e braços"),
            ("Treino B - Lower Body", "Foco em pernas e glúteos"),
            ("Treino C - Full Body", "Treino completo de corpo inteiro"),
            ("Treino D - Cardio + Core", "Cardio e abdômen"),
        ]
        
        maria_treinos = {}
        for nome_treino, desc_treino in treinos_maria:
            treino = db.query(Treino).filter(Treino.nome == nome_treino, Treino.criado_por == amigo1.id).first()
            if not treino:
                treino = Treino(nome=nome_treino, descricao=desc_treino, criado_por=amigo1.id)
                db.add(treino)
                db.commit()
                db.refresh(treino)
            maria_treinos[nome_treino] = treino
        
        print("✅ Treinos da Maria criados")
        
        # Associar exercícios aos treinos
        treino_exercicios_map = {
            "Treino A - Upper Body": [
                ("Supino Reto", "4", "10-12"),
                ("Supino Inclinado", "3", "12"),
                ("Puxada Frontal", "4", "12"),
                ("Remada Baixa", "3", "12"),
                ("Desenvolvimento", "3", "12"),
                ("Rosca Direta", "3", "15"),
                ("Tríceps Pulley", "3", "15"),
            ],
            "Treino B - Lower Body": [
                ("Agachamento Livre", "4", "12"),
                ("Leg Press", "4", "15"),
                ("Extensora", "3", "15"),
                ("Flexora", "3", "15"),
                ("Elevação Lateral", "3", "12"),
            ],
            "Treino C - Full Body": [
                ("Supino Reto", "3", "12"),
                ("Agachamento Livre", "3", "12"),
                ("Puxada Frontal", "3", "12"),
                ("Desenvolvimento", "3", "12"),
                ("Rosca Martelo", "2", "15"),
                ("Tríceps Testa", "2", "15"),
            ],
            "Treino D - Cardio + Core": [
                ("Corrida Esteira", "1", "20min"),
                ("Bicicleta Ergométrica", "1", "15min"),
                ("Abdominal Supra", "4", "20"),
                ("Prancha", "3", "45s"),
            ],
        }
        
        for treino_nome, exercicios_list in treino_exercicios_map.items():
            treino = maria_treinos.get(treino_nome)
            if treino:
                for ordem, (ex_nome, series, reps) in enumerate(exercicios_list, 1):
                    exercicio = exercicios.get(ex_nome)
                    if exercicio:
                        te = db.query(TreinoExercicio).filter(
                            TreinoExercicio.treino_id == treino.id,
                            TreinoExercicio.exercicio_id == exercicio.id
                        ).first()
                        if not te:
                            te = TreinoExercicio(
                                treino_id=treino.id,
                                exercicio_id=exercicio.id,
                                ordem=ordem,
                                series_sugeridas=series,
                                reps_sugeridas=reps
                            )
                            db.add(te)
        
        db.commit()
        print("✅ Exercícios associados aos treinos da Maria")
        
        # Atribuir treinos à Maria
        for treino_nome, treino in maria_treinos.items():
            atrib = db.query(TreinoAtribuido).filter(
                TreinoAtribuido.treino_id == treino.id,
                TreinoAtribuido.aluno_id == amigo1.id
            ).first()
            if not atrib:
                atrib = TreinoAtribuido(
                    treino_id=treino.id,
                    aluno_id=amigo1.id,
                    data_atribuicao=date.today() - timedelta(days=30),
                    ativo=True,
                    observacao="Treino personalizado"
                )
                db.add(atrib)
        
        db.commit()
        print("✅ Treinos atribuídos à Maria")
        
        # ==================== HISTÓRICO DE SÉRIES EXECUTADAS (30 dias) ====================
        
        # Simular 30 dias de treino para Maria
        hoje = datetime.now()
        
        # Verificar se já existem séries executadas
        series_existentes = db.query(SerieExecutada).filter(SerieExecutada.aluno_id == amigo1.id).count()
        
        if series_existentes < 50:  # Só criar se não houver muitas séries
            treinos_ordem = list(maria_treinos.values())
            
            for dias_atras in range(30, 0, -1):
                # Treina ~4x por semana
                if dias_atras % 2 == 0:  # Dias pares
                    data_treino = hoje - timedelta(days=dias_atras)
                    treino_idx = (30 - dias_atras) % len(treinos_ordem)
                    treino = treinos_ordem[treino_idx]
                    
                    # Obter exercícios do treino
                    treino_exs = db.query(TreinoExercicio).filter(
                        TreinoExercicio.treino_id == treino.id
                    ).all()
                    
                    for te in treino_exs:
                        exercicio = db.query(Exercicio).filter(Exercicio.id == te.exercicio_id).first()
                        if exercicio and exercicio.grupo_muscular != 'cardio':
                            # Criar 3-4 séries por exercício
                            num_series = random.randint(3, 4)
                            for serie_num in range(1, num_series + 1):
                                serie = SerieExecutada(
                                    aluno_id=amigo1.id,
                                    treino_id=treino.id,
                                    exercicio_id=te.exercicio_id,
                                    data_execucao=data_treino,
                                    serie_num=serie_num,
                                    repeticoes=random.randint(10, 15),
                                    carga_kg=round(random.uniform(15, 40), 1),
                                    observacao=None
                                )
                                db.add(serie)
            
            db.commit()
            print("✅ Histórico de séries executadas criado para Maria")
        
        # ==================== MEDIDAS CORPORAIS (histórico de evolução) ====================
        
        medidas_existentes = db.query(MedidaCorporal).filter(MedidaCorporal.aluno_id == amigo1.id).count()
        
        if medidas_existentes < 5:
            # Criar medidas semanais dos últimos 2 meses
            peso_inicial = 65.0
            for semana in range(8, 0, -1):
                data_medida = date.today() - timedelta(weeks=semana)
                peso_atual = peso_inicial - (0.3 * (8 - semana))  # Perda gradual de 0.3kg/semana
                
                medida = MedidaCorporal(
                    aluno_id=amigo1.id,
                    data_medida=data_medida,
                    peso_kg=round(peso_atual, 1),
                    braco_cm=round(28 + (0.2 * (8 - semana)), 1),
                    cintura_cm=round(70 - (0.5 * (8 - semana)), 1),
                    abdomen_cm=round(75 - (0.4 * (8 - semana)), 1),
                    peito_cm=round(88 + (0.1 * (8 - semana)), 1),
                    gordura_percent=round(24 - (0.5 * (8 - semana)), 1)
                )
                db.add(medida)
            
            db.commit()
            print("✅ Histórico de medidas corporais criado para Maria")
        
        # ==================== STREAK DA MARIA ====================
        
        streak_maria = db.query(Streak).filter(Streak.usuario_id == amigo1.id).first()
        if not streak_maria:
            streak_maria = Streak(
                usuario_id=amigo1.id,
                inicio=date.today() - timedelta(days=15),
                atual=15,
                ultimo_dia=date.today()
            )
            db.add(streak_maria)
            db.commit()
            print("✅ Streak de 15 dias criado para Maria")
        
        # ==================== AMIZADES ====================
        
        # Amizade: user <-> amigo1
        amizade1 = db.query(Amizade).filter(
            ((Amizade.solicitante_id == user.id) & (Amizade.solicitado_id == amigo1.id)) |
            ((Amizade.solicitante_id == amigo1.id) & (Amizade.solicitado_id == user.id))
        ).first()
        
        if not amizade1:
            amizade1 = Amizade(
                solicitante_id=user.id,
                solicitado_id=amigo1.id,
                status="aceito"
            )
            db.add(amizade1)
            print("✅ Amizade criada: João <-> Maria")
        
        # Amizade: user <-> amigo2
        amizade2 = db.query(Amizade).filter(
            ((Amizade.solicitante_id == user.id) & (Amizade.solicitado_id == amigo2.id)) |
            ((Amizade.solicitante_id == amigo2.id) & (Amizade.solicitado_id == user.id))
        ).first()
        
        if not amizade2:
            amizade2 = Amizade(
                solicitante_id=amigo2.id,
                solicitado_id=user.id,
                status="aceito"
            )
            db.add(amizade2)
            print("✅ Amizade criada: João <-> Pedro")
        
        # Amizade: maria <-> pedro
        amizade3 = db.query(Amizade).filter(
            ((Amizade.solicitante_id == amigo1.id) & (Amizade.solicitado_id == amigo2.id)) |
            ((Amizade.solicitante_id == amigo2.id) & (Amizade.solicitado_id == amigo1.id))
        ).first()
        
        if not amizade3:
            amizade3 = Amizade(
                solicitante_id=amigo1.id,
                solicitado_id=amigo2.id,
                status="aceito"
            )
            db.add(amizade3)
            print("✅ Amizade criada: Maria <-> Pedro")
        
        # ==================== BADGES ====================
        
        badges_data = [
            ("iniciante", "Iniciante", "Completou o primeiro treino", "🥉"),
            ("guerreiro", "Guerreiro", "7 dias de streak", "🔥"),
            ("dedicado", "Dedicado", "30 treinos completos", "💪"),
            ("social", "Social", "Adicionou 5 amigos", "👥"),
            ("legend", "Lenda", "100 treinos completos", "🏆"),
            ("consistente", "Consistente", "Treinou 4x na semana", "📈"),
            ("madrugador", "Madrugador", "Treino antes das 7h", "🌅"),
            ("forte", "Força Bruta", "Levantou 1000kg em um dia", "🦾"),
        ]
        
        badges_dict = {}
        for codigo, nome, descricao, icone in badges_data:
            badge = db.query(Badge).filter(Badge.codigo == codigo).first()
            if not badge:
                badge = Badge(codigo=codigo, nome=nome, descricao=descricao, icone_url=icone)
                db.add(badge)
                db.commit()
                db.refresh(badge)
                print(f"✅ Badge criado: {nome}")
            badges_dict[codigo] = badge
        
        # ==================== BADGES DA MARIA ====================
        
        maria_badges = ["iniciante", "guerreiro", "dedicado", "social", "consistente"]
        for badge_codigo in maria_badges:
            badge = badges_dict.get(badge_codigo)
            if badge:
                user_badge = db.query(UsuarioBadge).filter(
                    UsuarioBadge.usuario_id == amigo1.id,
                    UsuarioBadge.badge_id == badge.id
                ).first()
                if not user_badge:
                    # Diferentes datas para cada badge
                    dias_atras = maria_badges.index(badge_codigo) * 7
                    user_badge = UsuarioBadge(
                        usuario_id=amigo1.id,
                        badge_id=badge.id
                    )
                    db.add(user_badge)
        
        db.commit()
        print("✅ Badges atribuídos à Maria")
        
        # ==================== PROGRESSO DOS USUÁRIOS ====================
        
        for u in [user, amigo2]:
            progresso = db.query(UsuarioProgresso).filter(UsuarioProgresso.usuario_id == u.id).first()
            if not progresso:
                progresso = UsuarioProgresso(
                    usuario_id=u.id,
                    moedas=100,
                    xp_total=500,
                    nivel=2,
                    titulo_atual="Iniciante"
                )
                db.add(progresso)
                print(f"✅ Progresso criado para: {u.nome}")
        
        # Progresso especial para Maria (conta demo)
        progresso_maria = db.query(UsuarioProgresso).filter(UsuarioProgresso.usuario_id == amigo1.id).first()
        if not progresso_maria:
            progresso_maria = UsuarioProgresso(
                usuario_id=amigo1.id,
                moedas=850,
                xp_total=4200,
                nivel=8,
                titulo_atual="Guerreira Fitness"
            )
            db.add(progresso_maria)
            print("✅ Progresso especial criado para Maria")
        else:
            # Atualizar progresso existente
            progresso_maria.moedas = 850
            progresso_maria.xp_total = 4200
            progresso_maria.nivel = 8
            progresso_maria.titulo_atual = "Guerreira Fitness"
            print("✅ Progresso da Maria atualizado")
        
        # ==================== DESAFIOS ====================
        
        desafios_data = [
            ("Semana de Força", "Complete 5 treinos de força esta semana", "series", 5),
            ("Maratona Cardio", "Acumule 60 minutos de cardio", "tempo", 60),
            ("Volume Total", "Levante 10.000kg em uma semana", "volume", 10000),
            ("Desafio 30 Dias", "Treine todos os dias por 30 dias", "series", 30),
            ("Queima Calórica", "Queime 5000 calorias esta semana", "tempo", 5000),
        ]
        
        desafios_dict = {}
        for titulo, descricao, tipo, alvo in desafios_data:
            desafio = db.query(Desafio).filter(Desafio.titulo == titulo).first()
            if not desafio:
                desafio = Desafio(
                    titulo=titulo,
                    descricao=descricao,
                    tipo=tipo,
                    alvo_valor=alvo,
                    ativo=True
                )
                db.add(desafio)
                db.commit()
                db.refresh(desafio)
                print(f"✅ Desafio criado: {titulo}")
            desafios_dict[titulo] = desafio
        
        # Desafios da Maria (alguns completos, outros em andamento)
        maria_desafios = [
            ("Semana de Força", True, 5),  # Completo
            ("Maratona Cardio", True, 60),  # Completo
            ("Volume Total", False, 7500),  # Em andamento (75%)
            ("Desafio 30 Dias", False, 15),  # Em andamento (50%)
        ]
        
        for titulo, concluido, progresso in maria_desafios:
            desafio = desafios_dict.get(titulo)
            if desafio:
                user_desafio = db.query(UsuarioDesafio).filter(
                    UsuarioDesafio.usuario_id == amigo1.id,
                    UsuarioDesafio.desafio_id == desafio.id
                ).first()
                if not user_desafio:
                    user_desafio = UsuarioDesafio(
                        usuario_id=amigo1.id,
                        desafio_id=desafio.id,
                        data_inicio=date.today() - timedelta(days=14),
                        progresso=progresso,
                        concluido=concluido,
                        data_conclusao=datetime.now() if concluido else None
                    )
                    db.add(user_desafio)
        
        db.commit()
        print("✅ Desafios da Maria configurados")
        
        db.commit()
        
        print("\n" + "="*60)
        print("✨ BANCO DE DADOS POPULADO COM SUCESSO!")
        print("="*60)
        print("\n📝 CREDENCIAIS DE TESTE:")
        print("-" * 40)
        print("   Admin:   admin@fitdata.com / Admin@123")
        print("   Usuário: usuario@fitdata.com / Usuario@123")
        print("   Pedro:   pedro@fitdata.com / Pedro@123")
        print("-" * 40)
        print("\n🌟 CONTA DE DEMONSTRAÇÃO (recomendada):")
        print("-" * 40)
        print("   📧 Email: maria@fitdata.com")
        print("   🔑 Senha: Maria@123")
        print("-" * 40)
        print("\n   A conta da Maria possui:")
        print("   ✓ Histórico de 30 dias de treinos")
        print("   ✓ 4 treinos personalizados completos")
        print("   ✓ Evolução de medidas corporais")
        print("   ✓ 5 badges conquistados")
        print("   ✓ Desafios em andamento e completos")
        print("   ✓ Streak de 15 dias")
        print("   ✓ Nível 8 com 4200 XP")
        print("   ✓ Perfil completo com redes sociais")
        print("   ✓ Amizades com João e Pedro")
        print("\n👥 AMIZADES CONFIGURADAS:")
        print("   João ↔ Maria ↔ Pedro")
        print("   João ↔ Pedro")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao popular banco de dados: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
