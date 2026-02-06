"""
Script para popular o banco de dados com dados iniciais
Execute com: python seed.py
"""

from database import SessionLocal, Base, engine
from models import (
    Usuario, Amizade, Badge, UsuarioProgresso, Desafio, 
    Exercicio, Treino, TreinoExercicio, TreinoAtribuido, 
    SerieExecutada, MedidaCorporal, UsuarioDesafio, UsuarioBadge, Streak,
    CoachStudent, CoachInviteToken
)
from security import hash_password
from datetime import date, datetime, timedelta
import random
import secrets

def seed_database():
    """Cria usuários padrão e dados de teste no banco de dados"""
    
    # Cria as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # ==================== EXERCÍCIOS ====================
        
        exercicios_data = [
            ("Supino Reto", "peito", "Exercício básico para desenvolvimento peitoral",
             "1. Deite no banco com os pés apoiados no chão\n2. Segure a barra na largura dos ombros\n3. Desça a barra até tocar levemente o peito\n4. Empurre para cima até estender os braços",
             "Mantenha as escápulas retraídas e deprimidas. Não arqueie excessivamente a lombar. Desça controladamente.",
             "Peitoral maior, deltóide anterior, tríceps", "intermediario", "Barra, banco reto"),
            ("Supino Inclinado", "peito", "Foco na porção superior do peitoral",
             "1. Ajuste o banco a 30-45°\n2. Segure os halteres na altura do peito\n3. Empurre para cima até estender\n4. Desça controladamente",
             "Ângulo de 30° é ideal para clavicular. Não deixe os cotovelos abrirem demais.",
             "Peitoral clavicular, deltóide anterior, tríceps", "intermediario", "Halteres, banco inclinado"),
            ("Crucifixo", "peito", "Isolamento do peitoral",
             "1. Deite no banco com halteres acima do peito\n2. Abra os braços em arco lateral\n3. Desça até sentir alongamento no peito\n4. Feche os braços retornando à posição inicial",
             "Mantenha uma leve flexão nos cotovelos. Foque na contração do peitoral ao fechar.",
             "Peitoral maior", "iniciante", "Halteres, banco reto"),
            ("Agachamento Livre", "pernas", "Exercício composto para quadríceps e glúteos",
             "1. Posicione a barra nos trapézios\n2. Pés na largura dos ombros\n3. Desça até as coxas ficarem paralelas ao chão\n4. Suba empurrando o chão com os pés",
             "Joelhos devem seguir a direção dos pés. Mantenha o core ativado e a coluna neutra.",
             "Quadríceps, glúteos, isquiotibiais, eretores", "intermediario", "Barra, rack"),
            ("Leg Press", "pernas", "Exercício em máquina para pernas",
             "1. Sente-se na máquina com as costas apoiadas\n2. Posicione os pés na plataforma (largura dos ombros)\n3. Solte a trava e desça até 90°\n4. Empurre a plataforma para cima",
             "Não trave os joelhos na extensão completa. Ajuste os pés para enfatizar quadríceps (mais baixo) ou glúteos (mais alto).",
             "Quadríceps, glúteos, isquiotibiais", "iniciante", "Máquina Leg Press"),
            ("Extensora", "pernas", "Isolamento de quadríceps",
             "1. Sente na máquina e ajuste o apoio nas canelas\n2. Estenda as pernas até a completa extensão\n3. Segure por 1 segundo no topo\n4. Retorne controladamente",
             "Não use impulso. Foque na contração do quadríceps no topo do movimento.",
             "Quadríceps", "iniciante", "Máquina Extensora"),
            ("Flexora", "pernas", "Isolamento de posteriores",
             "1. Deite na máquina com os calcanhares sob o apoio\n2. Flexione os joelhos trazendo o apoio em direção aos glúteos\n3. Segure por 1 segundo\n4. Retorne controladamente",
             "Mantenha o quadril pressionado contra o apoio. Não levante a pelve.",
             "Isquiotibiais", "iniciante", "Máquina Flexora"),
            ("Puxada Frontal", "costas", "Desenvolvimento da largura das costas",
             "1. Segure a barra na pegada aberta (1.5x largura dos ombros)\n2. Sente com os joelhos travados sob o apoio\n3. Puxe a barra até a parte superior do peito\n4. Retorne controladamente",
             "Inicie o movimento retraindo as escápulas. Mantenha o tronco levemente inclinado para trás.",
             "Dorsal, redondo maior, bíceps, rombóides", "iniciante", "Máquina Puxada"),
            ("Remada Curvada", "costas", "Espessura das costas",
             "1. Segure a barra com pegada pronada\n2. Incline o tronco a 45° com joelhos semiflexionados\n3. Puxe a barra em direção ao abdômen\n4. Retorne controladamente",
             "Mantenha a coluna neutra durante todo o movimento. Não use impulso do tronco.",
             "Dorsal, rombóides, trapézio, bíceps", "intermediario", "Barra"),
            ("Remada Baixa", "costas", "Costas médias e inferiores",
             "1. Sente na máquina com os pés apoiados\n2. Segure o triângulo ou barra reta\n3. Puxe em direção ao abdômen\n4. Estenda controladamente",
             "Não incline o tronco para trás excessivamente. Foque na retração das escápulas.",
             "Dorsal, rombóides, trapézio inferior", "iniciante", "Máquina Remada Baixa"),
            ("Desenvolvimento", "ombros", "Desenvolvimento de deltoides",
             "1. Sente com as costas apoiadas\n2. Segure os halteres na altura dos ombros\n3. Empurre para cima até estender os braços\n4. Retorne à posição inicial",
             "Não arqueie a lombar. Mantenha o core ativado. Os halteres devem se encontrar no topo.",
             "Deltóide anterior, deltóide lateral, tríceps", "intermediario", "Halteres, banco com encosto"),
            ("Elevação Lateral", "ombros", "Isolamento de deltoides laterais",
             "1. Em pé, halteres ao lado do corpo\n2. Eleve os braços lateralmente até a altura dos ombros\n3. Mantenha os cotovelos levemente flexionados\n4. Desça controladamente",
             "Não use impulso. Imagine derramar água de um copo (rotação interna leve). Carga leve para iniciantes.",
             "Deltóide lateral", "iniciante", "Halteres"),
            ("Rosca Direta", "bíceps", "Exercício básico para bíceps",
             "1. Em pé, segure a barra com pegada supinada\n2. Mantenha os cotovelos junto ao corpo\n3. Flexione os braços subindo a barra\n4. Desça controladamente",
             "Não balance o tronco. Mantenha os cotovelos fixos. Contraia no topo do movimento.",
             "Bíceps braquial, braquial", "iniciante", "Barra reta ou W"),
            ("Rosca Martelo", "bíceps", "Bíceps e antebraços",
             "1. Em pé, halteres ao lado com pegada neutra\n2. Flexione alternadamente ou simultaneamente\n3. Mantenha os cotovelos junto ao corpo\n4. Desça controladamente",
             "A pegada neutra enfatiza o braquial e braquiorradial. Ótimo para largura do braço.",
             "Braquial, bíceps braquial, braquiorradial", "iniciante", "Halteres"),
            ("Tríceps Pulley", "tríceps", "Isolamento de tríceps",
             "1. Em pé frente ao cabo, segure a barra ou corda\n2. Mantenha os cotovelos junto ao corpo\n3. Estenda os braços para baixo\n4. Retorne controladamente sem mover os cotovelos",
             "Os cotovelos devem permanecer fixos. Com corda, abra as mãos na parte inferior para maior contração.",
             "Tríceps (cabeça lateral e medial)", "iniciante", "Cabo, barra ou corda"),
            ("Tríceps Testa", "tríceps", "Desenvolvimento completo do tríceps",
             "1. Deite no banco segurando a barra W\n2. Braços estendidos acima do peito\n3. Flexione os cotovelos descendo a barra em direção à testa\n4. Estenda os braços retornando",
             "Mantenha os cotovelos apontando para o teto. Desça a barra atrás da cabeça para maior ativação da cabeça longa.",
             "Tríceps (cabeça longa, lateral e medial)", "intermediario", "Barra W, banco reto"),
            ("Abdominal Supra", "abdômen", "Exercício para reto abdominal",
             "1. Deite com os joelhos flexionados e pés no chão\n2. Mãos atrás da cabeça ou cruzadas no peito\n3. Eleve os ombros do chão contraindo o abdômen\n4. Desça controladamente",
             "Não puxe a cabeça com as mãos. O movimento deve ser curto e controlado. Expire ao subir.",
             "Reto abdominal (porção superior)", "iniciante", "Colchonete"),
            ("Prancha", "abdômen", "Core estabilização",
             "1. Apoie os antebraços no chão, cotovelos sob os ombros\n2. Estenda as pernas apoiando nos dedos dos pés\n3. Mantenha o corpo reto como uma prancha\n4. Segure a posição pelo tempo determinado",
             "Não deixe o quadril cair ou subir demais. Ative o core puxando o umbigo para dentro. Respire normalmente.",
             "Core (reto abdominal, oblíquos, transverso, eretores)", "iniciante", "Colchonete"),
            ("Corrida Esteira", "cardio", "Cardio para queima calórica",
             "1. Inicie caminhando por 2-3 min para aquecimento\n2. Aumente gradualmente a velocidade\n3. Mantenha o ritmo na zona cardíaca alvo\n4. Reduza a velocidade nos últimos 2-3 min",
             "Use tênis adequado. Mantenha 60-80% da FCmax para queima de gordura. Hidrate-se durante.",
             "Quadríceps, isquiotibiais, panturrilhas, cardiovascular", "iniciante", "Esteira"),
            ("Bicicleta Ergométrica", "cardio", "Cardio de baixo impacto",
             "1. Ajuste o banco na altura correta\n2. Inicie com aquecimento leve de 3 min\n3. Aumente a resistência gradualmente\n4. Mantenha a cadência de 60-90 RPM",
             "Ótimo para quem tem problemas nos joelhos. Alterne entre baixa e alta intensidade (HIIT).",
             "Quadríceps, isquiotibiais, panturrilhas, cardiovascular", "iniciante", "Bicicleta ergométrica"),
        ]
        
        exercicios = {}
        for item in exercicios_data:
            nome, grupo, desc = item[0], item[1], item[2]
            instrucoes = item[3] if len(item) > 3 else None
            dicas = item[4] if len(item) > 4 else None
            musculos = item[5] if len(item) > 5 else None
            nivel = item[6] if len(item) > 6 else "iniciante"
            equipamento = item[7] if len(item) > 7 else None
            
            exercicio = db.query(Exercicio).filter(Exercicio.nome == nome).first()
            if not exercicio:
                exercicio = Exercicio(
                    nome=nome, grupo_muscular=grupo, descricao=desc,
                    instrucoes=instrucoes, dicas=dicas,
                    musculos_trabalhados=musculos, nivel=nivel,
                    equipamento=equipamento
                )
                db.add(exercicio)
                db.commit()
                db.refresh(exercicio)
            else:
                # Update existing exercises with tutorial data
                if instrucoes and not exercicio.instrucoes:
                    exercicio.instrucoes = instrucoes
                    exercicio.dicas = dicas
                    exercicio.musculos_trabalhados = musculos
                    exercicio.nivel = nivel
                    exercicio.equipamento = equipamento
                    db.commit()
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
        
        # ==================== COACH (INSTRUTOR) ====================
        
        coach = db.query(Usuario).filter(Usuario.email == "coach@fitdata.com").first()
        if not coach:
            coach = Usuario(
                nome="Carlos Coach",
                email="coach@fitdata.com",
                senha_hash=hash_password("Coach@123"),
                perfil="instrutor",
                coach_status="approved",
                cref="012345-G/SP",
                especialidade="Musculação e Hipertrofia",
                coach_bio="Personal Trainer certificado com 10 anos de experiência. Especialista em hipertrofia e emagrecimento. CREF ativo.",
                bio="🏋️ Personal Trainer | 💪 CREF 012345-G/SP\n📊 +200 alunos transformados",
                data_nascimento=date(1988, 11, 5),
                peso_kg=82.0,
                altura_cm=180,
                genero="masculino",
                instagram="@carloscoach_fit",
                linkedin="carlos-coach-personal"
            )
            db.add(coach)
            db.commit()
            db.refresh(coach)
            print("✅ Coach criado: coach@fitdata.com / Coach@123 (aprovado)")
        else:
            # Ensure coach has approved status
            if coach.coach_status != "approved":
                coach.coach_status = "approved"
                coach.cref = coach.cref or "012345-G/SP"
                coach.especialidade = coach.especialidade or "Musculação e Hipertrofia"
                db.commit()
            print("⚠️ Coach já existe")
        
        # ==================== COACH-STUDENT CONNECTION ====================
        
        # Connect coach to Maria
        coach_maria = db.query(CoachStudent).filter(
            CoachStudent.coach_id == coach.id,
            CoachStudent.student_id == amigo1.id
        ).first()
        if not coach_maria:
            coach_maria = CoachStudent(
                coach_id=coach.id,
                student_id=amigo1.id,
                status="active",
                connected_at=datetime.now() - timedelta(days=30)
            )
            db.add(coach_maria)
            print("✅ Conexão Coach → Maria criada")
        
        # Connect coach to user (João)
        coach_joao = db.query(CoachStudent).filter(
            CoachStudent.coach_id == coach.id,
            CoachStudent.student_id == user.id
        ).first()
        if not coach_joao:
            coach_joao = CoachStudent(
                coach_id=coach.id,
                student_id=user.id,
                status="active",
                connected_at=datetime.now() - timedelta(days=15)
            )
            db.add(coach_joao)
            print("✅ Conexão Coach → João criada")
        
        # Create an invite token for the coach
        existing_token = db.query(CoachInviteToken).filter(
            CoachInviteToken.coach_id == coach.id,
            CoachInviteToken.active == True
        ).first()
        if not existing_token:
            invite_token = CoachInviteToken(
                coach_id=coach.id,
                token="DEMO-COACH-TOKEN-2025",
                max_uses=100,
                uses=2,
                expires_at=datetime.now() + timedelta(days=365),
                active=True
            )
            db.add(invite_token)
            print("✅ Token de convite do coach criado: DEMO-COACH-TOKEN-2025")
        
        db.commit()
        
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
        print("\n�️ CONTA DE COACH (instrutor):")
        print("-" * 40)
        print("   📧 Email: coach@fitdata.com")
        print("   🔑 Senha: Coach@123")
        print("   📋 CREF: 012345-G/SP")
        print("   ✅ Status: Aprovado")
        print("   🔗 Token de convite: DEMO-COACH-TOKEN-2025")
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
        print("   ✓ Conectada ao Coach Carlos")
        print("\n👥 CONEXÕES:")
        print("   Coach Carlos → Maria (ativa)")
        print("   Coach Carlos → João (ativa)")
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
