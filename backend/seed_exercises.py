"""
Seed 50+ exercises with full metadata: instructions, tips, muscles, equipment, level.
Run: python seed_exercises.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'fitdata_dev.db')

EXERCISES = [
    # ===== PEITO (Chest) =====
    {
        "nome": "Supino Reto com Barra",
        "grupo_muscular": "Peito",
        "descricao": "Exercício composto para desenvolvimento do peitoral maior.",
        "instrucoes": "1. Deite no banco reto com os pés no chão\n2. Segure a barra na largura dos ombros\n3. Desça a barra até tocar o peito\n4. Empurre para cima até os braços ficarem estendidos",
        "dicas": "Mantenha as escápulas retraídas. Não quique a barra no peito. Controle a descida.",
        "musculos_trabalhados": "Peitoral Maior, Tríceps, Deltóide Anterior",
        "nivel": "intermediario",
        "equipamento": "Barra, Banco Reto"
    },
    {
        "nome": "Supino Inclinado com Halteres",
        "grupo_muscular": "Peito",
        "descricao": "Foco na porção superior (clavicular) do peitoral.",
        "instrucoes": "1. Ajuste o banco a 30-45 graus\n2. Segure os halteres com pegada neutra\n3. Desça controladamente até sentir alongamento no peito\n4. Empurre para cima em arco",
        "dicas": "Angulação de 30° é ideal para peitoral superior. Não abra muito os cotovelos.",
        "musculos_trabalhados": "Peitoral Superior, Deltóide Anterior, Tríceps",
        "nivel": "intermediario",
        "equipamento": "Halteres, Banco Inclinável"
    },
    {
        "nome": "Supino Declinado",
        "grupo_muscular": "Peito",
        "descricao": "Enfatiza a porção inferior do peitoral.",
        "instrucoes": "1. Deite no banco declinado e prenda os pés\n2. Segure a barra posicionada acima do peito inferior\n3. Desça a barra até tocar a parte baixa do peito\n4. Empurre de volta à posição inicial",
        "dicas": "Ótimo para definição da parte inferior do peito. Use cargas moderadas.",
        "musculos_trabalhados": "Peitoral Inferior, Tríceps, Deltóide Anterior",
        "nivel": "intermediario",
        "equipamento": "Barra, Banco Declinado"
    },
    {
        "nome": "Crucifixo com Halteres",
        "grupo_muscular": "Peito",
        "descricao": "Exercício de isolamento para peitoral com ênfase no alongamento.",
        "instrucoes": "1. Deite no banco reto com halteres acima do peito\n2. Com ligeira flexão nos cotovelos, abra os braços\n3. Desça até sentir alongamento no peito\n4. Retorne à posição inicial contraindo o peito",
        "dicas": "Não use carga excessiva. Foque na contração e alongamento. Cotovelos ligeiramente flexionados.",
        "musculos_trabalhados": "Peitoral Maior, Deltóide Anterior",
        "nivel": "iniciante",
        "equipamento": "Halteres, Banco Reto"
    },
    {
        "nome": "Crossover na Polia",
        "grupo_muscular": "Peito",
        "descricao": "Exercício de isolamento com cabo para definição do peitoral.",
        "instrucoes": "1. Posicione as polias na posição alta\n2. Segure os cabos e dê um passo à frente\n3. Com os braços levemente flexionados, traga as mãos ao centro\n4. Aperte o peito na contração e retorne controladamente",
        "dicas": "Varie a altura das polias para enfatizar diferentes partes do peitoral. Mantenha o tronco levemente inclinado.",
        "musculos_trabalhados": "Peitoral Maior, Peitoral Menor, Deltóide Anterior",
        "nivel": "intermediario",
        "equipamento": "Máquina de Cabos (Crossover)"
    },
    {
        "nome": "Flexão de Braços",
        "grupo_muscular": "Peito",
        "descricao": "Exercício com peso corporal para peito, tríceps e core.",
        "instrucoes": "1. Posicione as mãos na largura dos ombros\n2. Mantenha o corpo em linha reta da cabeça aos pés\n3. Desça o peito até quase tocar o chão\n4. Empurre de volta à posição inicial",
        "dicas": "Para iniciantes, faça com os joelhos no chão. Avançados podem elevar os pés.",
        "musculos_trabalhados": "Peitoral Maior, Tríceps, Deltóide Anterior, Core",
        "nivel": "iniciante",
        "equipamento": "Nenhum (Peso Corporal)"
    },

    # ===== COSTAS (Back) =====
    {
        "nome": "Puxada Frontal",
        "grupo_muscular": "Costas",
        "descricao": "Exercício para largura das costas, foca no latíssimo do dorso.",
        "instrucoes": "1. Sente na máquina e segure a barra larga\n2. Puxe a barra até a parte superior do peito\n3. Mantenha o peito erguido e escápulas retraídas\n4. Retorne controladamente à posição inicial",
        "dicas": "Não puxe atrás do pescoço. Foque em puxar com os cotovelos, não com as mãos.",
        "musculos_trabalhados": "Latíssimo do Dorso, Bíceps, Rombóides, Trapézio Inferior",
        "nivel": "iniciante",
        "equipamento": "Máquina de Puxada (Pulley)"
    },
    {
        "nome": "Remada Curvada com Barra",
        "grupo_muscular": "Costas",
        "descricao": "Exercício composto para espessura das costas.",
        "instrucoes": "1. Segure a barra com pegada pronada na largura dos ombros\n2. Incline o tronco a 45 graus\n3. Puxe a barra em direção ao abdômen\n4. Aperte as escápulas no topo e desça controladamente",
        "dicas": "Mantenha as costas retas. Não use impulso do quadril. A barra deve ir ao umbigo.",
        "musculos_trabalhados": "Latíssimo do Dorso, Rombóides, Trapézio, Bíceps, Eretor da Espinha",
        "nivel": "intermediario",
        "equipamento": "Barra"
    },
    {
        "nome": "Remada Baixa (Pulley)",
        "grupo_muscular": "Costas",
        "descricao": "Exercício de remada sentado no cabo para meio das costas.",
        "instrucoes": "1. Sente na máquina com os pés nos apoios\n2. Segure o triângulo ou barra reta\n3. Puxe em direção ao abdômen, apertando as escápulas\n4. Retorne estendendo os braços sem curvar as costas",
        "dicas": "Não balance o tronco para gerar impulso. Mantenha o peito erguido o tempo todo.",
        "musculos_trabalhados": "Latíssimo do Dorso, Rombóides, Trapézio Médio, Bíceps",
        "nivel": "iniciante",
        "equipamento": "Máquina de Remada (Pulley)"
    },
    {
        "nome": "Barra Fixa (Pull-up)",
        "grupo_muscular": "Costas",
        "descricao": "Exercício avançado com peso corporal para costas e bíceps.",
        "instrucoes": "1. Segure a barra com pegada pronada, mãos afastadas\n2. Pendure-se com os braços estendidos\n3. Puxe o corpo para cima até o queixo ultrapassar a barra\n4. Desça controladamente",
        "dicas": "Se não conseguir, use band assistida ou máquina gravitron. Evite kipping (balanço).",
        "musculos_trabalhados": "Latíssimo do Dorso, Bíceps, Rombóides, Trapézio, Antebraço",
        "nivel": "avancado",
        "equipamento": "Barra Fixa"
    },
    {
        "nome": "Remada Unilateral com Halter",
        "grupo_muscular": "Costas",
        "descricao": "Remada com um braço para desenvolvimento equilibrado das costas.",
        "instrucoes": "1. Apoie o joelho e a mão de um lado no banco\n2. Segure o halter com o braço oposto\n3. Puxe o halter em direção ao quadril\n4. Aperte a escápula no topo e desça controladamente",
        "dicas": "Mantenha o tronco paralelo ao chão. Não gire o tronco ao puxar.",
        "musculos_trabalhados": "Latíssimo do Dorso, Rombóides, Trapézio, Bíceps",
        "nivel": "iniciante",
        "equipamento": "Halter, Banco"
    },
    {
        "nome": "Pullover com Halter",
        "grupo_muscular": "Costas",
        "descricao": "Exercício que trabalha costas e peito simultaneamente.",
        "instrucoes": "1. Deite transversalmente no banco\n2. Segure o halter acima do peito com os braços estendidos\n3. Desça o halter atrás da cabeça em arco\n4. Retorne à posição inicial contraindo costas e peito",
        "dicas": "Mantenha os cotovelos ligeiramente flexionados. Desça até sentir bom alongamento.",
        "musculos_trabalhados": "Latíssimo do Dorso, Peitoral Maior, Serrátil Anterior, Tríceps",
        "nivel": "intermediario",
        "equipamento": "Halter, Banco"
    },

    # ===== OMBROS (Shoulders) =====
    {
        "nome": "Desenvolvimento Militar com Barra",
        "grupo_muscular": "Ombros",
        "descricao": "Exercício composto principal para desenvolvimento dos deltóides.",
        "instrucoes": "1. Segure a barra na frente dos ombros\n2. Empurre a barra verticalmente acima da cabeça\n3. Estenda completamente os braços\n4. Desça controladamente até os ombros",
        "dicas": "Mantenha o core contraído. Não incline excessivamente para trás. Respire ao empurrar.",
        "musculos_trabalhados": "Deltóide Anterior, Deltóide Lateral, Tríceps, Trapézio Superior",
        "nivel": "intermediario",
        "equipamento": "Barra, Rack"
    },
    {
        "nome": "Elevação Lateral",
        "grupo_muscular": "Ombros",
        "descricao": "Isolamento para o deltóide lateral, dá largura aos ombros.",
        "instrucoes": "1. Em pé, segure halteres ao lado do corpo\n2. Eleve os braços lateralmente até a linha dos ombros\n3. Mantenha ligeira flexão nos cotovelos\n4. Desça controladamente",
        "dicas": "Não balance o corpo. Use cargas leves com alta repetição. Polegar ligeiramente para baixo no topo.",
        "musculos_trabalhados": "Deltóide Lateral, Trapézio Superior",
        "nivel": "iniciante",
        "equipamento": "Halteres"
    },
    {
        "nome": "Elevação Frontal",
        "grupo_muscular": "Ombros",
        "descricao": "Isolamento para deltóide anterior.",
        "instrucoes": "1. Em pé, segure halteres à frente das coxas\n2. Eleve um braço ou ambos até a linha dos ombros\n3. Palmas voltadas para baixo\n4. Desça controladamente e alterne",
        "dicas": "Não use impulso. Controle o movimento tanto na subida quanto na descida.",
        "musculos_trabalhados": "Deltóide Anterior, Peitoral Superior",
        "nivel": "iniciante",
        "equipamento": "Halteres"
    },
    {
        "nome": "Face Pull",
        "grupo_muscular": "Ombros",
        "descricao": "Exercício essencial para saúde dos ombros e postura.",
        "instrucoes": "1. Configure a polia na altura do rosto\n2. Segure a corda com pegada neutra\n3. Puxe em direção ao rosto, abrindo os cotovelos\n4. Rotacione externamente os ombros e retorne",
        "dicas": "Exercício fundamental para prevenir lesões. Aperte bem as escápulas no final.",
        "musculos_trabalhados": "Deltóide Posterior, Trapézio, Rombóides, Rotadores Externos",
        "nivel": "iniciante",
        "equipamento": "Máquina de Cabos, Corda"
    },
    {
        "nome": "Desenvolvimento Arnold",
        "grupo_muscular": "Ombros",
        "descricao": "Variação criada por Arnold Schwarzenegger que trabalha os 3 deltóides.",
        "instrucoes": "1. Sentado, segure halteres na frente dos ombros (palmas para você)\n2. Rotacione e empurre simultaneamente para cima\n3. No topo, as palmas ficam para frente\n4. Retorne descendo e rotacionando de volta",
        "dicas": "Faça o movimento fluido, sem pausar na rotação. Carga moderada é suficiente.",
        "musculos_trabalhados": "Deltóide Anterior, Deltóide Lateral, Deltóide Posterior, Tríceps",
        "nivel": "intermediario",
        "equipamento": "Halteres, Banco com Encosto"
    },
    {
        "nome": "Encolhimento com Halteres",
        "grupo_muscular": "Ombros",
        "descricao": "Exercício de isolamento para o trapézio superior.",
        "instrucoes": "1. Em pé, segure halteres pesados ao lado do corpo\n2. Encolha os ombros para cima em direção às orelhas\n3. Segure a contração por 1-2 segundos\n4. Desça controladamente",
        "dicas": "Não rotacione os ombros. Movimento é vertical puro. Use straps se necessário.",
        "musculos_trabalhados": "Trapézio Superior, Levantador da Escápula",
        "nivel": "iniciante",
        "equipamento": "Halteres"
    },

    # ===== BÍCEPS =====
    {
        "nome": "Rosca Direta com Barra",
        "grupo_muscular": "Bíceps",
        "descricao": "Exercício clássico para desenvolvimento do bíceps.",
        "instrucoes": "1. Em pé, segure a barra com pegada supinada\n2. Mantenha os cotovelos junto ao corpo\n3. Flexione os braços levando a barra aos ombros\n4. Desça controladamente sem balançar",
        "dicas": "Não use impulso do corpo. Mantenha os cotovelos fixos. Contraia totalmente no topo.",
        "musculos_trabalhados": "Bíceps Braquial, Braquial, Braquiorradial",
        "nivel": "iniciante",
        "equipamento": "Barra Reta ou EZ"
    },
    {
        "nome": "Rosca Martelo",
        "grupo_muscular": "Bíceps",
        "descricao": "Trabalha bíceps com ênfase no braquial e antebraço.",
        "instrucoes": "1. Em pé, segure halteres com pegada neutra (palmas voltadas uma para outra)\n2. Flexione alternadamente ou simultaneamente\n3. Mantenha os cotovelos junto ao corpo\n4. Desça controladamente",
        "dicas": "Excelente para espessura do braço. Não balance os halteres.",
        "musculos_trabalhados": "Bíceps Braquial, Braquial, Braquiorradial",
        "nivel": "iniciante",
        "equipamento": "Halteres"
    },
    {
        "nome": "Rosca Concentrada",
        "grupo_muscular": "Bíceps",
        "descricao": "Isolamento máximo do bíceps com apoio do cotovelo.",
        "instrucoes": "1. Sente com as pernas abertas\n2. Apoie o cotovelo na parte interna da coxa\n3. Flexione o halter até o ombro\n4. Desça controladamente estendendo o braço",
        "dicas": "Foque na contração do bíceps. Não use o corpo para ajudar. Excelente para pico do bíceps.",
        "musculos_trabalhados": "Bíceps Braquial (cabeça curta)",
        "nivel": "iniciante",
        "equipamento": "Halter, Banco"
    },
    {
        "nome": "Rosca Scott (Preacher Curl)",
        "grupo_muscular": "Bíceps",
        "descricao": "Isolamento completo do bíceps no banco Scott.",
        "instrucoes": "1. Posicione os braços no apoio do banco Scott\n2. Segure a barra EZ com pegada supinada\n3. Flexione até a contração máxima\n4. Desça controladamente sem estender completamente",
        "dicas": "Não descanse na parte inferior do movimento. Controle a fase negativa.",
        "musculos_trabalhados": "Bíceps Braquial, Braquial",
        "nivel": "intermediario",
        "equipamento": "Barra EZ, Banco Scott"
    },

    # ===== TRÍCEPS =====
    {
        "nome": "Tríceps Pulley (Pushdown)",
        "grupo_muscular": "Tríceps",
        "descricao": "Exercício de isolamento para tríceps no cabo.",
        "instrucoes": "1. Posicione a polia na posição alta\n2. Segure a barra reta ou corda\n3. Com os cotovelos fixos, empurre para baixo\n4. Estenda completamente e retorne controladamente",
        "dicas": "Cotovelos colados ao corpo. Não incline o tronco. Aperte na extensão completa.",
        "musculos_trabalhados": "Tríceps (cabeça lateral e medial)",
        "nivel": "iniciante",
        "equipamento": "Máquina de Cabos, Barra Reta ou Corda"
    },
    {
        "nome": "Tríceps Testa (Skull Crusher)",
        "grupo_muscular": "Tríceps",
        "descricao": "Isolamento do tríceps deitado com barra.",
        "instrucoes": "1. Deite no banco reto segurando a barra EZ acima do peito\n2. Flexione os cotovelos descendo a barra em direção à testa\n3. Mantenha os braços superiores fixos\n4. Estenda os braços de volta",
        "dicas": "Cuidado com a carga — use spotters se necessário. Cotovelos apontando para o teto.",
        "musculos_trabalhados": "Tríceps (cabeça longa e medial)",
        "nivel": "intermediario",
        "equipamento": "Barra EZ, Banco Reto"
    },
    {
        "nome": "Tríceps Francês (Overhead)",
        "grupo_muscular": "Tríceps",
        "descricao": "Extensão acima da cabeça para cabeça longa do tríceps.",
        "instrucoes": "1. Segure um halter com ambas as mãos acima da cabeça\n2. Flexione os cotovelos levando o halter atrás da cabeça\n3. Mantenha os braços junto às orelhas\n4. Estenda de volta à posição superior",
        "dicas": "A cabeça longa do tríceps é melhor trabalhada em posição acima da cabeça. Controle a descida.",
        "musculos_trabalhados": "Tríceps (cabeça longa, lateral, medial)",
        "nivel": "intermediario",
        "equipamento": "Halter ou Barra EZ"
    },
    {
        "nome": "Mergulho em Barras Paralelas",
        "grupo_muscular": "Tríceps",
        "descricao": "Exercício composto pesado para tríceps e peito.",
        "instrucoes": "1. Segure as barras paralelas e suspenda o corpo\n2. Desça flexionando os cotovelos até 90 graus\n3. Mantenha o tronco ereto para focar no tríceps\n4. Empurre de volta à posição superior",
        "dicas": "Tronco ereto = mais tríceps. Tronco inclinado = mais peito. Não desça demais para proteger os ombros.",
        "musculos_trabalhados": "Tríceps, Peitoral Inferior, Deltóide Anterior",
        "nivel": "avancado",
        "equipamento": "Barras Paralelas"
    },

    # ===== PERNAS (Quadríceps) =====
    {
        "nome": "Agachamento Livre",
        "grupo_muscular": "Pernas",
        "descricao": "Rei dos exercícios — trabalha todo o corpo inferior.",
        "instrucoes": "1. Posicione a barra nos trapézios\n2. Pés na largura dos ombros, pontas levemente para fora\n3. Agache até as coxas ficarem paralelas ao chão\n4. Empurre através dos calcanhares para retornar",
        "dicas": "Joelhos seguem a direção dos pés. Core sempre contraído. Não deixe os joelhos passarem muito dos pés.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Isquiotibiais, Core, Eretores da Espinha",
        "nivel": "intermediario",
        "equipamento": "Barra, Rack (Squat Rack)"
    },
    {
        "nome": "Leg Press 45°",
        "grupo_muscular": "Pernas",
        "descricao": "Exercício seguro e eficaz para força de pernas.",
        "instrucoes": "1. Sente na máquina com as costas apoiadas\n2. Posicione os pés na plataforma na largura dos ombros\n3. Destravar e descer flexionando os joelhos a 90°\n4. Empurre controladamente até quase estender",
        "dicas": "Não trave os joelhos!! Variações: pés altos = mais glúteos, pés baixos = mais quadríceps.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Isquiotibiais",
        "nivel": "iniciante",
        "equipamento": "Máquina Leg Press"
    },
    {
        "nome": "Cadeira Extensora",
        "grupo_muscular": "Pernas",
        "descricao": "Isolamento do quadríceps.",
        "instrucoes": "1. Sente na máquina com as costas apoiadas\n2. Posicione o rolo nos tornozelos\n3. Estenda os joelhos até quase travar\n4. Desça controladamente",
        "dicas": "Aperte o quadríceps no topo por 1 segundo. Não use impulso. Ideal para aquecimento e finalização.",
        "musculos_trabalhados": "Quadríceps (Reto Femoral, Vasto Medial, Vasto Lateral, Vasto Intermédio)",
        "nivel": "iniciante",
        "equipamento": "Cadeira Extensora"
    },
    {
        "nome": "Cadeira Flexora",
        "grupo_muscular": "Pernas",
        "descricao": "Isolamento dos isquiotibiais (posterior da coxa).",
        "instrucoes": "1. Deite de bruços na máquina\n2. Posicione o rolo atrás dos tornozelos\n3. Flexione os joelhos trazendo os calcanhares em direção ao glúteo\n4. Desça controladamente",
        "dicas": "Contraia o glúteo durante o exercício. Não levante o quadril do banco.",
        "musculos_trabalhados": "Isquiotibiais (Bíceps Femoral, Semitendíneo, Semimembranoso)",
        "nivel": "iniciante",
        "equipamento": "Cadeira Flexora"
    },
    {
        "nome": "Afundo (Lunge)",
        "grupo_muscular": "Pernas",
        "descricao": "Exercício unilateral para pernas e equilíbrio.",
        "instrucoes": "1. Em pé, dê um passo largo à frente\n2. Flexione ambos os joelhos até 90 graus\n3. O joelho de trás quase toca o chão\n4. Empurre com o pé da frente para retornar",
        "dicas": "Tronco ereto. Joelho da frente não ultrapassa o pé. Alterne as pernas.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Isquiotibiais, Core",
        "nivel": "iniciante",
        "equipamento": "Halteres (opcional)"
    },
    {
        "nome": "Agachamento Hack",
        "grupo_muscular": "Pernas",
        "descricao": "Agachamento na máquina com foco no quadríceps.",
        "instrucoes": "1. Posicione as costas e ombros nos apoios\n2. Pés na plataforma na largura dos ombros\n3. Destravar e agachar até 90 graus\n4. Empurre de volta à posição inicial",
        "dicas": "Coloque os pés mais baixos para focar no quadríceps. Pés altos para glúteos.",
        "musculos_trabalhados": "Quadríceps, Glúteos",
        "nivel": "intermediario",
        "equipamento": "Máquina Hack Squat"
    },
    {
        "nome": "Búlgaro (Afundo Elevado)",
        "grupo_muscular": "Pernas",
        "descricao": "Afundo com pé traseiro elevado — excelente para glúteos e equilíbrio.",
        "instrucoes": "1. Posicione o pé de trás em um banco\n2. Com o pé da frente firme, agache controladamente\n3. Flexione o joelho da frente até 90 graus\n4. Empurre através do calcanhar e retorne",
        "dicas": "Mantenha o tronco ereto. Comece sem carga para dominar o equilíbrio.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Isquiotibiais, Core",
        "nivel": "avancado",
        "equipamento": "Banco, Halteres (opcional)"
    },

    # ===== GLÚTEOS =====
    {
        "nome": "Hip Thrust",
        "grupo_muscular": "Glúteos",
        "descricao": "Exercício principal para ativação e desenvolvimento dos glúteos.",
        "instrucoes": "1. Apoie a parte superior das costas em um banco\n2. Posicione a barra sobre o quadril\n3. Com os pés no chão, eleve o quadril contraindo os glúteos\n4. Segure a contração no topo e desça controladamente",
        "dicas": "Use proteção para a barra. Queixo para o peito no topo. Aperte por 2s no pico.",
        "musculos_trabalhados": "Glúteo Máximo, Glúteo Médio, Isquiotibiais",
        "nivel": "intermediario",
        "equipamento": "Barra, Banco, Protetor"
    },
    {
        "nome": "Abdução de Quadril na Máquina",
        "grupo_muscular": "Glúteos",
        "descricao": "Isolamento para glúteo médio e lateral.",
        "instrucoes": "1. Sente na máquina com as pernas juntas\n2. Afaste as pernas contra a resistência\n3. Mantenha a contração por 1 segundo\n4. Retorne controladamente",
        "dicas": "Incline o tronco à frente para maior ativação do glúteo médio.",
        "musculos_trabalhados": "Glúteo Médio, Glúteo Mínimo, Tensor da Fáscia Lata",
        "nivel": "iniciante",
        "equipamento": "Máquina Abdutora"
    },
    {
        "nome": "Elevação Pélvica",
        "grupo_muscular": "Glúteos",
        "descricao": "Versão sem equipamento do hip thrust para ativação dos glúteos.",
        "instrucoes": "1. Deite de costas com os joelhos flexionados\n2. Pés no chão, braços ao lado do corpo\n3. Eleve o quadril contraindo os glúteos\n4. Segure no topo e desça controladamente",
        "dicas": "Coloque um peso no quadril para mais resistência. Ótimo para aquecimento.",
        "musculos_trabalhados": "Glúteo Máximo, Isquiotibiais, Core",
        "nivel": "iniciante",
        "equipamento": "Nenhum (Peso Corporal)"
    },

    # ===== PANTURRILHA =====
    {
        "nome": "Elevação de Panturrilha em Pé",
        "grupo_muscular": "Panturrilha",
        "descricao": "Desenvolvimento do gastrocnêmio (panturrilha).",
        "instrucoes": "1. Em pé na máquina ou em um step\n2. Eleve os calcanhares o máximo possível\n3. Aperte a panturrilha no topo\n4. Desça abaixo da linha do step para alongar",
        "dicas": "Full range of motion é essencial. Pause no topo por 1s. 15-20 reps funcionam melhor.",
        "musculos_trabalhados": "Gastrocnêmio, Sóleo",
        "nivel": "iniciante",
        "equipamento": "Step ou Máquina de Panturrilha"
    },
    {
        "nome": "Elevação de Panturrilha Sentado",
        "grupo_muscular": "Panturrilha",
        "descricao": "Foco no músculo sóleo, parte profunda da panturrilha.",
        "instrucoes": "1. Sente na máquina com os joelhos sob o apoio\n2. Eleve os calcanhares empurrando o peso\n3. Aperte no topo do movimento\n4. Desça controladamente alongando",
        "dicas": "O sóleo é melhor trabalhado sentado. Use séries altas (15-25 reps).",
        "musculos_trabalhados": "Sóleo, Gastrocnêmio",
        "nivel": "iniciante",
        "equipamento": "Máquina de Panturrilha Sentado"
    },

    # ===== ABDÔMEN =====
    {
        "nome": "Abdominal Supra (Crunch)",
        "grupo_muscular": "Abdômen",
        "descricao": "Exercício clássico para o reto abdominal superior.",
        "instrucoes": "1. Deite com joelhos flexionados e pés no chão\n2. Mãos atrás da cabeça ou cruzadas no peito\n3. Eleve os ombros do chão contraindo o abdômen\n4. Desça controladamente sem relaxar completamente",
        "dicas": "Não puxe o pescoço. Foque em encurtar a distância entre costelas e quadril.",
        "musculos_trabalhados": "Reto Abdominal (superior), Oblíquos",
        "nivel": "iniciante",
        "equipamento": "Nenhum (Colchonete)"
    },
    {
        "nome": "Prancha (Plank)",
        "grupo_muscular": "Abdômen",
        "descricao": "Exercício isométrico para core e estabilidade.",
        "instrucoes": "1. Posição de flexão, apoiando nos antebraços\n2. Corpo em linha reta da cabeça aos pés\n3. Contraia o core e segure a posição\n4. Mantenha por 30-60 segundos",
        "dicas": "Não deixe o quadril subir ou descer. Respire normalmente. Aumento gradual do tempo.",
        "musculos_trabalhados": "Reto Abdominal, Transverso do Abdômen, Oblíquos, Eretores da Espinha",
        "nivel": "iniciante",
        "equipamento": "Nenhum (Colchonete)"
    },
    {
        "nome": "Abdominal Infra (Leg Raise)",
        "grupo_muscular": "Abdômen",
        "descricao": "Foco na porção inferior do reto abdominal.",
        "instrucoes": "1. Deite com as mãos sob o quadril ou seguindo em algo\n2. Eleve as pernas estendidas até 90 graus\n3. Desça controladamente sem tocar o chão\n4. Mantenha a lombar pressionada no chão",
        "dicas": "Se muito difícil, flexione os joelhos. Não use impulso. Controle a descida.",
        "musculos_trabalhados": "Reto Abdominal (inferior), Flexores do Quadril",
        "nivel": "intermediario",
        "equipamento": "Nenhum (Colchonete)"
    },
    {
        "nome": "Abdominal Bicicleta",
        "grupo_muscular": "Abdômen",
        "descricao": "Trabalha reto abdominal e oblíquos simultaneamente.",
        "instrucoes": "1. Deite com as mãos atrás da cabeça\n2. Eleve os ombros e leve o cotovelo ao joelho oposto\n3. Estenda a perna oposta\n4. Alterne os lados em movimento de pedalar",
        "dicas": "Movimento controlado, não rápido. Foco na rotação do tronco, não do pescoço.",
        "musculos_trabalhados": "Reto Abdominal, Oblíquos Internos, Oblíquos Externos",
        "nivel": "iniciante",
        "equipamento": "Nenhum (Colchonete)"
    },
    {
        "nome": "Abdominal na Roda (Ab Wheel)",
        "grupo_muscular": "Abdômen",
        "descricao": "Exercício avançado de anti-extensão para core forte.",
        "instrucoes": "1. Ajoelhe segurando a roda abdominal\n2. Role para frente estendendo o corpo\n3. Mantenha o core contraído o tempo todo\n4. Puxe de volta à posição inicial usando o abdômen",
        "dicas": "Comece com amplitude curta. Não deixe a lombar hiperextender. Core 100% ativo.",
        "musculos_trabalhados": "Reto Abdominal, Transverso, Oblíquos, Serrátil, Latíssimo",
        "nivel": "avancado",
        "equipamento": "Roda Abdominal"
    },

    # ===== ANTEBRAÇO =====
    {
        "nome": "Rosca de Punho",
        "grupo_muscular": "Antebraço",
        "descricao": "Fortalecimento dos flexores do punho.",
        "instrucoes": "1. Sente e apoie os antebraços nas coxas\n2. Segure a barra com palmas para cima\n3. Flexione os punhos para cima\n4. Desça controladamente",
        "dicas": "Use cargas leves. Séries altas (15-20). Ideal no final do treino de bíceps.",
        "musculos_trabalhados": "Flexores do Punho, Flexores dos Dedos",
        "nivel": "iniciante",
        "equipamento": "Barra ou Halteres"
    },

    # ===== CARDIO =====
    {
        "nome": "Corrida na Esteira",
        "grupo_muscular": "Cardio",
        "descricao": "Exercício cardiovascular clássico para resistência.",
        "instrucoes": "1. Aqueça por 5 minutos caminhando\n2. Aumente a velocidade gradualmente\n3. Mantenha a intensidade desejada\n4. Finalize com 5 minutos de volta à calma",
        "dicas": "Use inclinação de 1-2% para simular corrida ao ar livre. Hidrate-se.",
        "musculos_trabalhados": "Quadríceps, Isquiotibiais, Panturrilha, Core, Sistema Cardiovascular",
        "nivel": "iniciante",
        "equipamento": "Esteira"
    },
    {
        "nome": "Bicicleta Ergométrica",
        "grupo_muscular": "Cardio",
        "descricao": "Cardio de baixo impacto ideal para todas as idades.",
        "instrucoes": "1. Ajuste a altura do selim\n2. Pedale mantendo boa postura\n3. Varie a resistência durante a sessão\n4. Mantenha RPM constante",
        "dicas": "Excelente para quem tem problemas nos joelhos. Ajuste o selim na altura do quadril.",
        "musculos_trabalhados": "Quadríceps, Isquiotibiais, Glúteos, Panturrilha",
        "nivel": "iniciante",
        "equipamento": "Bicicleta Ergométrica"
    },
    {
        "nome": "Elíptico (Transport)",
        "grupo_muscular": "Cardio",
        "descricao": "Cardio total body com baixo impacto articular.",
        "instrucoes": "1. Suba no equipamento e segure os pegadores\n2. Comece a pedalar em movimento elíptico\n3. Use os braços para maior gasto calórico\n4. Varie a resistência e inclinação",
        "dicas": "Não se apoie nos pegadores. Mantenha postura ereta. Inverta a direção para variar.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Peito, Costas, Bíceps, Tríceps",
        "nivel": "iniciante",
        "equipamento": "Elíptico"
    },
    {
        "nome": "Remada Ergométrica (Remo)",
        "grupo_muscular": "Cardio",
        "descricao": "Cardio completo que trabalha 86% dos músculos do corpo.",
        "instrucoes": "1. Sente no remo e prenda os pés\n2. Segure a barra com braços estendidos\n3. Empurre com as pernas primeiro, depois puxe com as costas e braços\n4. Retorne na ordem inversa",
        "dicas": "A potência vem das pernas (60%), não dos braços. Mantenha ritmo constante.",
        "musculos_trabalhados": "Quadríceps, Glúteos, Costas, Bíceps, Core, Isquiotibiais",
        "nivel": "intermediario",
        "equipamento": "Remo Ergométrico"
    },

    # ===== TRAPÉZIO (mais detalhado) =====
    {
        "nome": "Remada Alta",
        "grupo_muscular": "Trapézio",
        "descricao": "Exercício para trapézio e deltóide lateral.",
        "instrucoes": "1. Em pé, segure a barra ou halteres à frente\n2. Puxe para cima mantendo os cotovelos altos\n3. Eleve até a linha do queixo\n4. Desça controladamente",
        "dicas": "Não eleve acima do queixo para proteger o ombro. Pegada mais larga = mais deltóide.",
        "musculos_trabalhados": "Trapézio Superior, Deltóide Lateral, Bíceps",
        "nivel": "intermediario",
        "equipamento": "Barra ou Halteres"
    },

    # ===== EXERCÍCIOS FUNCIONAIS =====
    {
        "nome": "Levantamento Terra (Deadlift)",
        "grupo_muscular": "Posterior",
        "descricao": "Exercício fundamental para força total do corpo.",
        "instrucoes": "1. Pés na largura dos ombros, barra sobre os pés\n2. Agache e segure a barra com pegada mista\n3. Mantenha as costas retas e levante com as pernas\n4. Estenda o quadril no topo e retorne controladamente",
        "dicas": "NUNCA arredonde a lombar. Barra próxima ao corpo o tempo todo. Core muito contraído.",
        "musculos_trabalhados": "Glúteos, Isquiotibiais, Eretores da Espinha, Trapézio, Quadríceps, Antebraço",
        "nivel": "avancado",
        "equipamento": "Barra, Anilhas"
    },
    {
        "nome": "Stiff (Levantamento Terra Romeno)",
        "grupo_muscular": "Posterior",
        "descricao": "Variação do terra focada nos isquiotibiais e glúteos.",
        "instrucoes": "1. Em pé, segure a barra à frente das coxas\n2. Desça a barra mantendo as pernas quase estendidas\n3. Empurre o quadril para trás\n4. Desça até sentir alongamento nos isquiotibiais",
        "dicas": "As pernas ficam com leve flexão, não totalmente retas. Sinta o alongamento posterior.",
        "musculos_trabalhados": "Isquiotibiais, Glúteos, Eretores da Espinha",
        "nivel": "intermediario",
        "equipamento": "Barra ou Halteres"
    },
    {
        "nome": "Burpee",
        "grupo_muscular": "Full Body",
        "descricao": "Exercício funcional de alta intensidade para condicionamento.",
        "instrucoes": "1. Agache e coloque as mãos no chão\n2. Salte os pés para trás ficando em posição de flexão\n3. Faça uma flexão\n4. Salte os pés para frente e pule com os braços para cima",
        "dicas": "A versão completa inclui flexão e salto. Reduza componentes para facilitar.",
        "musculos_trabalhados": "Peito, Tríceps, Core, Quadríceps, Glúteos, Sistema Cardiovascular",
        "nivel": "avancado",
        "equipamento": "Nenhum (Peso Corporal)"
    },
    {
        "nome": "Kettlebell Swing",
        "grupo_muscular": "Full Body",
        "descricao": "Exercício explosivo para potência e condicionamento.",
        "instrucoes": "1. Em pé, segure o kettlebell com ambas as mãos\n2. Incline o tronco e passe o kettlebell entre as pernas\n3. Estenda o quadril explosivamente projetando o kettlebell para frente\n4. Deixe o kettlebell retornar e repita o movimento",
        "dicas": "O poder vem do quadril, não dos braços. Mantenha o core firme. Braços são guias.",
        "musculos_trabalhados": "Glúteos, Isquiotibiais, Core, Deltóides, Eretores da Espinha",
        "nivel": "intermediario",
        "equipamento": "Kettlebell"
    },
]


def seed_exercises():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Clear existing exercises
    cur.execute("DELETE FROM exercicios")
    
    for ex in EXERCISES:
        cur.execute("""
            INSERT INTO exercicios (nome, grupo_muscular, descricao, instrucoes, dicas, musculos_trabalhados, nivel, equipamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ex["nome"],
            ex["grupo_muscular"],
            ex["descricao"],
            ex["instrucoes"],
            ex["dicas"],
            ex["musculos_trabalhados"],
            ex["nivel"],
            ex["equipamento"]
        ))
    
    conn.commit()
    count = cur.execute("SELECT COUNT(*) FROM exercicios").fetchone()[0]
    print(f"✅ {count} exercícios inseridos com sucesso!")
    
    # Show by group
    cur.execute("SELECT grupo_muscular, COUNT(*) as cnt FROM exercicios GROUP BY grupo_muscular ORDER BY cnt DESC")
    for row in cur.fetchall():
        print(f"   {row[0]}: {row[1]} exercícios")
    
    conn.close()


if __name__ == "__main__":
    seed_exercises()
