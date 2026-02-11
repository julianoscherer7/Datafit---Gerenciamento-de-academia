"""
AI Assistant Routes
- Smart exercise suggestions for coaches
- Training plan generation
- Exercise recommendations based on goals
- Nutritional guidance context
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
import random

from database import get_db
from models import Usuario, Exercicio, SerieExecutada, Treino, TreinoExercicio, CoachStudent, MedidaCorporal, AIChatHistory
from schemas import AIAssistantRequest, AIAssistantResponse
from security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai_assistant"])


# ==================== KNOWLEDGE BASE ====================

EXERCISE_DB = {
    "peito": {
        "iniciante": [
            {"nome": "Supino Reto com Barra", "series": "3", "reps": "12", "desc": "Base para desenvolvimento peitoral"},
            {"nome": "Supino Inclinado Halteres", "series": "3", "reps": "12", "desc": "Foco na porção superior"},
            {"nome": "Crucifixo Máquina", "series": "3", "reps": "15", "desc": "Isolamento seguro para iniciantes"},
        ],
        "intermediario": [
            {"nome": "Supino Reto", "series": "4", "reps": "10", "desc": "Carga progressiva"},
            {"nome": "Supino Inclinado", "series": "4", "reps": "10", "desc": "Porção clavicular"},
            {"nome": "Crucifixo com Halteres", "series": "3", "reps": "12", "desc": "Amplitude máxima"},
            {"nome": "Crossover", "series": "3", "reps": "15", "desc": "Contração de pico"},
        ],
        "avancado": [
            {"nome": "Supino Reto", "series": "5", "reps": "6-8", "desc": "Força máxima"},
            {"nome": "Supino Inclinado com Barra", "series": "4", "reps": "8-10", "desc": "Hipertrofia superior"},
            {"nome": "Supino Declinado", "series": "3", "reps": "10", "desc": "Porção esternal"},
            {"nome": "Crucifixo Inclinado", "series": "3", "reps": "12", "desc": "Isolamento clavicular"},
            {"nome": "Dips", "series": "3", "reps": "ao falhar", "desc": "Finalizador composto"},
        ],
    },
    "costas": {
        "iniciante": [
            {"nome": "Puxada Frontal", "series": "3", "reps": "12", "desc": "Largura das costas"},
            {"nome": "Remada Baixa", "series": "3", "reps": "12", "desc": "Espessura das costas"},
            {"nome": "Pulldown Supinado", "series": "3", "reps": "15", "desc": "Dorsal e bíceps"},
        ],
        "intermediario": [
            {"nome": "Puxada Frontal", "series": "4", "reps": "10", "desc": "Desenvolvimento dorsal"},
            {"nome": "Remada Curvada", "series": "4", "reps": "10", "desc": "Espessura e força"},
            {"nome": "Remada Unilateral", "series": "3", "reps": "12", "desc": "Correção de assimetrias"},
            {"nome": "Pullover", "series": "3", "reps": "15", "desc": "Expansão torácica"},
        ],
        "avancado": [
            {"nome": "Barra Fixa", "series": "4", "reps": "ao falhar", "desc": "Força funcional"},
            {"nome": "Remada Curvada", "series": "5", "reps": "6-8", "desc": "Força máxima"},
            {"nome": "Remada Cavaleiro", "series": "4", "reps": "10", "desc": "Espessura máxima"},
            {"nome": "Puxada Frontal Aberta", "series": "3", "reps": "12", "desc": "Largura dorsal"},
            {"nome": "Face Pull", "series": "3", "reps": "15", "desc": "Saúde dos ombros"},
        ],
    },
    "pernas": {
        "iniciante": [
            {"nome": "Agachamento Smith", "series": "3", "reps": "12", "desc": "Segurança para iniciantes"},
            {"nome": "Leg Press", "series": "3", "reps": "15", "desc": "Volume de pernas"},
            {"nome": "Extensora", "series": "3", "reps": "15", "desc": "Isolamento quadríceps"},
            {"nome": "Flexora", "series": "3", "reps": "15", "desc": "Isolamento posteriores"},
        ],
        "intermediario": [
            {"nome": "Agachamento Livre", "series": "4", "reps": "10", "desc": "Composto completo"},
            {"nome": "Leg Press 45°", "series": "4", "reps": "12", "desc": "Volume e hipertrofia"},
            {"nome": "Extensora", "series": "3", "reps": "15", "desc": "Quadríceps isolado"},
            {"nome": "Flexora", "series": "3", "reps": "12", "desc": "Posteriores isolados"},
            {"nome": "Panturrilha em Pé", "series": "4", "reps": "15", "desc": "Gastrocnêmio"},
        ],
        "avancado": [
            {"nome": "Agachamento Livre", "series": "5", "reps": "6-8", "desc": "Força máxima"},
            {"nome": "Agachamento Frontal", "series": "4", "reps": "8", "desc": "Quadríceps dominante"},
            {"nome": "Leg Press 45°", "series": "4", "reps": "12", "desc": "Volume adicional"},
            {"nome": "Stiff", "series": "4", "reps": "10", "desc": "Posteriores e glúteos"},
            {"nome": "Extensora Unilateral", "series": "3", "reps": "12", "desc": "Detalhamento"},
            {"nome": "Panturrilha", "series": "5", "reps": "15", "desc": "Volume panturrilhas"},
        ],
    },
    "ombros": {
        "iniciante": [
            {"nome": "Desenvolvimento Máquina", "series": "3", "reps": "12", "desc": "Segurança articular"},
            {"nome": "Elevação Lateral", "series": "3", "reps": "15", "desc": "Deltoides laterais"},
        ],
        "intermediario": [
            {"nome": "Desenvolvimento com Halteres", "series": "4", "reps": "10", "desc": "Deltoides anterior"},
            {"nome": "Elevação Lateral", "series": "4", "reps": "12", "desc": "Largura dos ombros"},
            {"nome": "Elevação Frontal", "series": "3", "reps": "12", "desc": "Porção anterior"},
            {"nome": "Face Pull", "series": "3", "reps": "15", "desc": "Porção posterior"},
        ],
        "avancado": [
            {"nome": "Desenvolvimento Militar", "series": "5", "reps": "6-8", "desc": "Força overhead"},
            {"nome": "Elevação Lateral", "series": "4", "reps": "12", "desc": "Cabeça lateral"},
            {"nome": "Arnold Press", "series": "4", "reps": "10", "desc": "Rotação completa"},
            {"nome": "Crucifixo Invertido", "series": "3", "reps": "15", "desc": "Deltóide posterior"},
            {"nome": "Shrug", "series": "4", "reps": "12", "desc": "Trapézio"},
        ],
    },
    "bracos": {
        "iniciante": [
            {"nome": "Rosca Direta", "series": "3", "reps": "12", "desc": "Bíceps completo"},
            {"nome": "Tríceps Pulley", "series": "3", "reps": "15", "desc": "Tríceps básico"},
        ],
        "intermediario": [
            {"nome": "Rosca Direta", "series": "3", "reps": "10", "desc": "Bíceps com carga"},
            {"nome": "Rosca Martelo", "series": "3", "reps": "12", "desc": "Bíceps e antebraço"},
            {"nome": "Tríceps Testa", "series": "3", "reps": "12", "desc": "Cabeça longa"},
            {"nome": "Tríceps Pulley", "series": "3", "reps": "15", "desc": "Cabeça lateral"},
        ],
        "avancado": [
            {"nome": "Rosca Direta Barra W", "series": "4", "reps": "8", "desc": "Bíceps máximo"},
            {"nome": "Rosca Scott", "series": "3", "reps": "10", "desc": "Pico do bíceps"},
            {"nome": "Rosca Martelo", "series": "3", "reps": "12", "desc": "Braquial"},
            {"nome": "Tríceps Francês", "series": "4", "reps": "10", "desc": "Cabeça longa"},
            {"nome": "Tríceps Banco", "series": "3", "reps": "ao falhar", "desc": "Finalizador"},
        ],
    },
}

TRAINING_SPLITS = {
    "iniciante": {
        "2_dias": ["Full Body A", "Full Body B"],
        "3_dias": ["Push (Peito + Ombros + Tríceps)", "Pull (Costas + Bíceps)", "Legs (Pernas)"],
    },
    "intermediario": {
        "3_dias": ["Push", "Pull", "Legs"],
        "4_dias": ["Superior A", "Inferior A", "Superior B", "Inferior B"],
        "5_dias": ["Peito", "Costas", "Pernas", "Ombros", "Braços"],
    },
    "avancado": {
        "5_dias": ["Peito", "Costas", "Pernas", "Ombros + Trapézio", "Braços"],
        "6_dias": ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
    },
}

GOAL_ADVICE = {
    "hipertrofia": {
        "series": "3-5 por exercício",
        "reps": "8-12 repetições",
        "descanso": "60-90 segundos",
        "frequencia": "4-6x por semana",
        "dica": "Foque em progressão de carga e volume total. Mantenha as repetições na faixa de 8-12 com descansos de 60-90s."
    },
    "forca": {
        "series": "4-6 por exercício",
        "reps": "3-6 repetições",
        "descanso": "2-5 minutos",
        "frequencia": "3-5x por semana",
        "dica": "Priorize exercícios compostos pesados (agachamento, supino, terra). Descansos mais longos são essenciais."
    },
    "emagrecimento": {
        "series": "3-4 por exercício",
        "reps": "12-20 repetições",
        "descanso": "30-60 segundos",
        "frequencia": "4-6x por semana",
        "dica": "Combine treino com cardio e déficit calórico. Mantenha a intensidade alta com descansos curtos."
    },
    "resistencia": {
        "series": "2-3 por exercício",
        "reps": "15-25 repetições",
        "descanso": "30-45 segundos",
        "frequencia": "3-5x por semana",
        "dica": "Trabalhe com cargas mais leves e muitas repetições. Circuitos são uma boa opção."
    },
}


def generate_ai_response(message: str, context: str = None, student_data: dict = None):
    """Generate an intelligent response based on the message and context"""
    msg_lower = message.lower().strip()
    
    # Remove accents for better matching
    import unicodedata
    def remove_accents(text):
        return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    
    msg_normalized = remove_accents(msg_lower)
    
    # GREETING DETECTION
    greetings = ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "hey", "hello", "hi", "e ai", "eai", "fala"]
    if any(g == msg_lower or msg_normalized.startswith(g + " ") or msg_normalized == g for g in greetings):
        return {
            "response": "Olá! 👋 Sou o FitBot, seu assistente de treino. Como posso ajudar você hoje?\n\n"
                       "Posso ajudar com:\n"
                       "• **Treinos** - Montar, sugerir ou analisar seu treino\n"
                       "• **Exercícios** - Técnicas, substituições e progressões\n"
                       "• **Objetivos** - Hipertrofia, força, emagrecimento\n"
                       "• **Dicas** - Nutrição, descanso e suplementação\n\n"
                       "O que você gostaria de saber?"
        }
    
    # WORKOUT BALANCE/ANALYSIS
    balance_keywords = ["equilibrado", "balanceado", "esta bom", "está bom", "analisa", "analise", "analizar", "analisar", "o que acha", "avalia", "avaliar", "feedback", "correto", "certo"]
    if any(w in msg_normalized for w in balance_keywords):
        return {
            "response": "📊 **Análise do Treino:**\n\n"
                       "Para um treino bem equilibrado, considere:\n\n"
                       "✅ **Volume adequado:** 12-20 séries por grupo muscular/semana\n"
                       "✅ **Progressão de carga:** Aumente 2-5% quando completar todas as reps\n"
                       "✅ **Variedade:** Misture exercícios compostos e isoladores\n"
                       "✅ **Ordem:** Comece com compostos e finalize com isoladores\n"
                       "✅ **Descanso:** 48-72h entre o mesmo grupo muscular\n\n"
                       "💡 **Dica:** Se seu treino tem mais de 6-8 exercícios, considere dividir em dois dias."
        }
    
    # EQUIVALENT/SUBSTITUTE EXERCISES
    substitute_keywords = ["equivalente", "substitui", "substituir", "trocar", "troca", "alternativa", "no lugar", "invés", "vez de", "similar", "parecido"]
    if any(w in msg_normalized for w in substitute_keywords):
        return {
            "response": "🔄 **Exercícios Substitutos:**\n\n"
                       "**Peito:**\n"
                       "• Supino reto → Supino máquina / Flexão\n"
                       "• Crucifixo → Crossover / Peck deck\n\n"
                       "**Costas:**\n"
                       "• Puxada frontal → Barra fixa / Pulldown\n"
                       "• Remada curvada → Remada cavaleiro / Remada unilateral\n\n"
                       "**Pernas:**\n"
                       "• Agachamento → Leg press / Hack squat\n"
                       "• Stiff → Flexora / Good morning\n\n"
                       "**Ombros:**\n"
                       "• Desenvolvimento → Arnold press / Máquina\n\n"
                       "**Braços:**\n"
                       "• Rosca direta → Rosca scott / Rosca martelo\n"
                       "• Tríceps testa → Tríceps corda / Francês\n\n"
                       "💡 Qual exercício precisa substituir?"
        }
    
    # COACH CONTEXT: Training plan suggestions
    if context == "coach_training" or any(w in msg_normalized for w in ["treino para", "montar treino", "plano de treino", "criar treino", "montar um treino", "monta um treino", "faz um treino", "faca um treino"]):
        # Detect level
        nivel = "intermediario"
        if any(w in msg_normalized for w in ["iniciante", "comecando", "novo", "basico"]):
            nivel = "iniciante"
        elif any(w in msg_normalized for w in ["avancado", "experiente", "pesado", "hardcore"]):
            nivel = "avancado"
        
        # Detect muscle group
        grupo = None
        if any(w in msg_normalized for w in ["peito", "peitoral", "chest"]):
            grupo = "peito"
        elif any(w in msg_normalized for w in ["costas", "dorsal", "back"]):
            grupo = "costas"
        elif any(w in msg_normalized for w in ["perna", "quadriceps", "posterior", "legs", "pernas"]):
            grupo = "pernas"
        elif any(w in msg_normalized for w in ["ombro", "deltoide", "shoulder", "ombros"]):
            grupo = "ombros"
        elif any(w in msg_normalized for w in ["braco", "biceps", "triceps", "arms", "bracos"]):
            grupo = "bracos"
        
        if grupo and grupo in EXERCISE_DB:
            exercises = EXERCISE_DB[grupo].get(nivel, EXERCISE_DB[grupo]["intermediario"])
            response = f"🏋️ **Sugestão de Treino de {grupo.title()} ({nivel.title()})**\n\n"
            for i, ex in enumerate(exercises, 1):
                response += f"**{i}. {ex['nome']}** - {ex['series']}x{ex['reps']}\n   _{ex['desc']}_\n\n"
            response += f"\n💡 **Dica:** Descanso de 60-90s entre séries para hipertrofia."
            
            return {
                "response": response,
                "exercises": exercises,
                "suggestions": [
                    {"type": "add_to_training", "label": f"Criar treino de {grupo.title()}"}
                ]
            }
        
        # General training plan
        splits = TRAINING_SPLITS.get(nivel, TRAINING_SPLITS["intermediario"])
        response = f"📋 **Sugestões de Divisão de Treino ({nivel.title()})**\n\n"
        for dias, split in splits.items():
            response += f"**{dias.replace('_', ' ')}:**\n"
            for i, dia in enumerate(split, 1):
                response += f"  {i}. {dia}\n"
            response += "\n"
        response += "Qual divisão prefere? Posso detalhar cada dia com exercícios específicos."
        
        return {"response": response, "suggestions": [
            {"type": "detail_split", "label": f"Detalhar {k}"} for k in splits.keys()
        ]}
    
    # EXERCISE SUGGESTIONS
    exercise_keywords = ["exercicio para", "exercício para", "sugestao de exercicio", "sugestão de exercício", "qual exercicio", "qual exercício", "opção de", "opcao de", "sugere", "sugerir", "sugestao", "sugestão", "exercícios de", "exercicios de"]
    if context == "exercise_suggestion" or any(w in msg_normalized for w in exercise_keywords):
        grupo = None
        for g in ["peito", "costas", "pernas", "ombros", "bracos"]:
            if g in msg_normalized or (g == "bracos" and any(w in msg_normalized for w in ["braco", "biceps", "triceps"])):
                grupo = g
                break
        
        if grupo and grupo in EXERCISE_DB:
            nivel = "intermediario"
            exercises = EXERCISE_DB[grupo][nivel]
            response = f"💪 **Exercícios para {grupo.title()}:**\n\n"
            for ex in exercises:
                response += f"• **{ex['nome']}** ({ex['series']}x{ex['reps']})\n  {ex['desc']}\n\n"
            return {"response": response, "exercises": exercises}
        
        response = "Posso sugerir exercícios para:\n\n"
        response += "• 🫁 **Peito** - Supino, crucifixo, crossover\n"
        response += "• 🔙 **Costas** - Puxada, remada, pullover\n"
        response += "• 🦵 **Pernas** - Agachamento, leg press, extensora\n"
        response += "• 💪 **Ombros** - Desenvolvimento, elevação lateral\n"
        response += "• 🦾 **Braços** - Rosca, tríceps, martelo\n\n"
        response += "Qual grupo muscular deseja trabalhar?"
        return {"response": response}
    
    # GOAL-BASED ADVICE
    hipertrofia_keywords = ["hipertrofia", "ganhar massa", "crescer", "volume muscular", "ganho de massa", "aumentar musculo", "ficar grande", "massa muscular", "musculos", "músculos"]
    if any(w in msg_normalized for w in hipertrofia_keywords):
        advice = GOAL_ADVICE["hipertrofia"]
        response = f"🎯 **Protocolo para Hipertrofia**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}\n\n"
        response += "**Princípios chave:**\n"
        response += "• Progressão de carga gradual (2-5% por semana)\n"
        response += "• Tensão mecânica: controle da fase excêntrica\n"
        response += "• Volume semanal: 10-20 séries por grupo muscular\n"
        response += "• Frequência: cada músculo 2x por semana"
        return {"response": response}
    
    emagrecimento_keywords = ["emagrecer", "perder peso", "secar", "definir", "cutting", "gordura", "perder gordura", "queimar", "definição", "definicao"]
    if any(w in msg_normalized for w in emagrecimento_keywords):
        advice = GOAL_ADVICE["emagrecimento"]
        response = f"🔥 **Protocolo para Emagrecimento**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}\n\n"
        response += "**Princípios chave:**\n"
        response += "• Déficit calórico moderado (300-500 kcal)\n"
        response += "• Priorize proteína (1.8-2.2g/kg)\n"
        response += "• Cardio: 2-4x semana (HIIT ou LISS)\n"
        response += "• Mantenha o treino de força para preservar massa"
        return {"response": response}
    
    forca_keywords = ["forca", "força", "powerlifting", "carga maxima", "carga máxima", "mais forte", "aumentar forca", "aumentar força", "levantar mais"]
    if any(w in msg_normalized for w in forca_keywords):
        advice = GOAL_ADVICE["forca"]
        response = f"⚡ **Protocolo para Força**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}\n\n"
        response += "**Princípios chave:**\n"
        response += "• Foque nos \"Big 3\": Agachamento, Supino, Terra\n"
        response += "• Progressão linear ou ondulatória\n"
        response += "• Técnica perfeita antes de aumentar carga\n"
        response += "• Periodização: Acumulação → Intensificação → Realização"
        return {"response": response}
    
    # NUTRITION CONTEXT
    if any(w in msg_normalized for w in ["dieta", "nutricao", "alimentacao", "calorias", "proteina", "macros", "comer", "comida", "alimentar", "nutrir", "pre treino", "pos treino", "pre-treino", "pos-treino"]):
        response = "🥗 **Orientações Nutricionais Gerais**\n\n"
        response += "**Proteína:** 1.6-2.2g por kg de peso corporal\n"
        response += "**Carboidratos:** 3-5g por kg (ajustar com objetivo)\n"
        response += "**Gorduras:** 0.8-1.2g por kg\n\n"
        response += "**Dicas práticas:**\n"
        response += "• Distribua proteína ao longo do dia (4-6 refeições)\n"
        response += "• Carboidratos complexos pré-treino (1-2h antes)\n"
        response += "• Hidratação: mínimo 35ml por kg de peso\n"
        response += "• Pós-treino: proteína + carbo rápido (30-60min)\n\n"
        response += "⚠️ *Para um plano nutricional detalhado, consulte um nutricionista.*"
        return {"response": response}
    
    # SUPPLEMENT CONTEXT
    suplemento_keywords = ["suplemento", "creatina", "whey", "pre-treino", "pré-treino", "bcaa", "cafeina", "proteina", "glutamina", "termogenico"]
    if any(w in msg_normalized for w in suplemento_keywords):
        response = "💊 **Guia de Suplementação**\n\n"
        response += "**Essenciais (com evidência científica):**\n"
        response += "• **Creatina Monohidratada** - 3-5g/dia (todos os dias)\n"
        response += "• **Whey Protein** - 20-40g pós-treino (para atingir meta proteica)\n"
        response += "• **Vitamina D** - Se baixa exposição solar\n\n"
        response += "**Opcionais:**\n"
        response += "• **Cafeína** - 3-6mg/kg pré-treino (performance)\n"
        response += "• **Beta-Alanina** - 3-6g/dia (endurance muscular)\n"
        response += "• **Ômega 3** - 2-3g/dia (anti-inflamatório)\n\n"
        response += "⚠️ *Suplementos são complementos, não substitutos de uma boa alimentação.*"
        return {"response": response}
    
    # REST/RECOVERY
    recovery_keywords = ["descanso", "recovery", "recuperacao", "recuperação", "overtraining", "dor muscular", "doms", "dormir", "sono", "fadiga", "cansado"]
    if any(w in msg_normalized for w in recovery_keywords):
        response = "😴 **Recuperação e Descanso**\n\n"
        response += "• **Sono:** 7-9 horas por noite\n"
        response += "• **Descanso entre treinos:** Mesmo grupo muscular a cada 48-72h\n"
        response += "• **Deload:** A cada 4-6 semanas, reduza volume/intensidade em 40-50%\n"
        response += "• **Alongamento:** 10-15 min pós-treino\n"
        response += "• **Dor muscular (DOMS):** Normal nas primeiras 24-72h, pode treinar leve\n\n"
        response += "**Sinais de overtraining:**\n"
        response += "• Queda de performance por +2 semanas\n"
        response += "• Insônia ou fadiga crônica\n"
        response += "• Perda de apetite e motivação\n"
        response += "• Lesões frequentes"
        return {"response": response}
    
    # TECHNIQUE QUESTIONS
    tecnica_keywords = ["tecnica", "técnica", "postura", "forma", "execucao", "execução", "como fazer", "como executar", "forma correta", "jeito certo"]
    if any(w in msg_normalized for w in tecnica_keywords):
        response = "📐 **Técnica e Execução**\n\n"
        response += "**Princípios fundamentais:**\n"
        response += "• **Amplitude:** Use amplitude total controlada\n"
        response += "• **Excêntrica:** Controle a descida (2-3 segundos)\n"
        response += "• **Concêntrica:** Explosiva mas controlada\n"
        response += "• **Respiração:** Expire no esforço, inspire na volta\n\n"
        response += "**Erros comuns:**\n"
        response += "• Usar impulso/embalo para levantar peso\n"
        response += "• Amplitude parcial para usar mais carga\n"
        response += "• Descanso insuficiente entre séries pesadas\n\n"
        response += "💡 Qual exercício específico você quer melhorar?"
        return {"response": response}
    
    # WARM UP / INJURY PREVENTION
    warmup_keywords = ["aquecimento", "aquecer", "alongar", "alongamento", "esticar", "lesao", "lesão", "prevenir", "prevenção", "prevencao", "mobilidade"]
    if any(w in msg_normalized for w in warmup_keywords):
        response = "🔥 **Aquecimento e Prevenção de Lesões**\n\n"
        response += "**Aquecimento ideal (10-15min):**\n"
        response += "1. **Aquecimento geral:** 5min cardio leve\n"
        response += "2. **Mobilidade articular:** Círculos e rotações\n"
        response += "3. **Ativação muscular:** Séries leves do exercício\n\n"
        response += "**Progressão de aquecimento:**\n"
        response += "• 1ª série: 50% da carga de trabalho x 12 reps\n"
        response += "• 2ª série: 70% da carga x 8 reps\n"
        response += "• 3ª série: 85% da carga x 4 reps\n"
        response += "• Depois: séries efetivas\n\n"
        response += "⚠️ Nunca pule o aquecimento, especialmente em exercícios pesados!"
        return {"response": response}
    
    # PLATEAU / STUCK PROGRESS
    plateau_keywords = ["estagnado", "estagnei", "nao evoluo", "não evoluo", "travado", "parei de", "nao consigo", "não consigo", "plateau", "platô"]
    if any(w in msg_normalized for w in plateau_keywords):
        response = "📈 **Quebrando Estagnação**\n\n"
        response += "**Estratégias para superar o platô:**\n\n"
        response += "1. **Variar estímulo:** Mude exercícios, ordem ou ângulos\n"
        response += "2. **Técnicas avançadas:** Drop-set, rest-pause, giant sets\n"
        response += "3. **Deload:** 1 semana com 50% do volume\n"
        response += "4. **Revisar dieta:** Ajuste calorias e proteína\n"
        response += "5. **Sono:** Priorize 7-9h de sono reparador\n\n"
        response += "**Técnicas intensificadoras:**\n"
        response += "• **Drop-set:** Reduz peso sem descanso\n"
        response += "• **Rest-pause:** Descansa 10-15s e continua\n"
        response += "• **Negativas:** Foco na fase excêntrica\n"
        response += "• **Super-séries:** Exercícios antagonistas sem descanso"
        return {"response": response}
    
    # BEGINNER QUESTIONS
    iniciante_keywords = ["iniciante", "comecando", "começando", "comeco", "começo", "primeiro treino", "nunca treinei", "novo na academia", "como comecar", "como começar"]
    if any(w in msg_normalized for w in iniciante_keywords):
        response = "🌱 **Guia para Iniciantes**\n\n"
        response += "**Primeiras semanas:**\n"
        response += "• 3x por semana é suficiente\n"
        response += "• Foque em aprender a técnica\n"
        response += "• Use cargas leves a moderadas\n"
        response += "• 2-3 séries de 12-15 repetições\n\n"
        response += "**Treino A/B sugerido:**\n"
        response += "**Dia A:** Peito, Ombros, Tríceps\n"
        response += "• Supino máquina 3x12\n"
        response += "• Desenvolvimento máquina 3x12\n"
        response += "• Tríceps pulley 3x15\n\n"
        response += "**Dia B:** Costas, Bíceps, Pernas\n"
        response += "• Puxada frontal 3x12\n"
        response += "• Rosca direta 3x12\n"
        response += "• Leg press 3x15\n\n"
        response += "💡 Nas primeiras 4 semanas, seu corpo está se adaptando. A evolução virá!"
        return {"response": response}
    
    # CONTEXT-AWARE: If there's training context, provide analysis
    if context and ("treino" in msg_normalized or "exercicio" in msg_normalized or len(msg_normalized) < 50):
        response = "🔍 **Analisando seu treino...**\n\n"
        response += "Sobre o treino atual, posso ajudar com:\n"
        response += "• Verificar se os exercícios estão bem ordenados\n"
        response += "• Sugerir alternativas ou adições\n"
        response += "• Ajustar volume e intensidade\n"
        response += "• Equilibrar grupos musculares\n\n"
        response += "O que você gostaria de saber especificamente?"
        return {"response": response}
    
    # DEFAULT: Contextual response based on message content
    # Try to extract something useful from the message
    if len(msg_normalized) > 3:
        response = f"🤔 Entendi que você quer saber sobre: **{message[:50]}{'...' if len(message) > 50 else ''}**\n\n"
        response += "Posso ajudar melhor se você especificar:\n\n"
        response += "**Sobre treinos:**\n"
        response += "• _\"Montar treino de [grupo muscular]\"_\n"
        response += "• _\"Esse treino está equilibrado?\"_\n"
        response += "• _\"Substituto para [exercício]\"_\n\n"
        response += "**Sobre objetivos:**\n"
        response += "• _\"Protocolo para hipertrofia\"_\n"
        response += "• _\"Como emagrecer treinando\"_\n"
        response += "• _\"Aumentar força\"_\n\n"
        response += "**Outras dúvidas:**\n"
        response += "• _\"Dicas de nutrição\"_\n"
        response += "• _\"Suplementos essenciais\"_\n"
        response += "• _\"Quanto tempo descansar\"_"
        return {"response": response}
    
    # ULTIMATE DEFAULT: Help message
    response = "👋 **Olá! Sou o FitBot, seu assistente de treino.**\n\n"
    response += "Posso ajudar você com:\n\n"
    response += "🏋️ **Treinos** - Montar planos personalizados\n"
    response += "💪 **Exercícios** - Técnicas e substituições\n"
    response += "🎯 **Objetivos** - Hipertrofia, força, emagrecimento\n"
    response += "🥗 **Nutrição** - Dieta e macros\n"
    response += "💊 **Suplementos** - Guia baseado em ciência\n"
    response += "😴 **Recuperação** - Descanso e prevenção\n\n"
    response += "**Digite sua pergunta!** Por exemplo:\n"
    response += "• _\"Monte um treino de peito\"_\n"
    response += "• _\"Protocolo de hipertrofia\"_\n"
    response += "• _\"Exercícios para iniciante\"_"
    return {"response": response}


# ==================== ROUTES ====================

@router.post("/chat")
def ai_chat(
    data: AIAssistantRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-powered chat assistant for coaches and users with conversation memory"""
    user_id = current_user["user_id"]
    
    # Get student data if coach is asking about a specific student
    student_data = None
    if data.student_id and current_user["perfil"] == "instrutor":
        student = db.query(Usuario).filter(Usuario.id == data.student_id).first()
        if student:
            student_data = {
                "nome": student.nome,
                "peso_kg": float(student.peso_kg) if student.peso_kg else None,
                "altura_cm": float(student.altura_cm) if student.altura_cm else None,
            }
    
    # Retrieve recent conversation history for context (last 10 messages)
    recent_history = db.query(AIChatHistory).filter(
        AIChatHistory.usuario_id == user_id
    ).order_by(AIChatHistory.criado_em.desc()).limit(10).all()
    recent_history.reverse()  # chronological order
    
    # Build context string with history
    context_with_history = data.context or ""
    if recent_history:
        history_str = "\n".join([f"{'Usuário' if h.role == 'user' else 'FitBot'}: {h.content[:200]}" for h in recent_history[-6:]])
        context_with_history = f"Histórico recente:\n{history_str}\n\n{context_with_history}"
    
    result = generate_ai_response(data.message, context_with_history, student_data)
    
    # Store user message and response in history
    try:
        user_msg = AIChatHistory(
            usuario_id=user_id,
            role="user",
            content=data.message[:500],
            context=data.context[:200] if data.context else None
        )
        db.add(user_msg)
        
        bot_response = result.get("response", "")
        bot_msg = AIChatHistory(
            usuario_id=user_id,
            role="assistant",
            content=bot_response[:500]
        )
        db.add(bot_msg)
        
        # Keep only the last 50 messages per user
        total = db.query(AIChatHistory).filter(AIChatHistory.usuario_id == user_id).count()
        if total > 50:
            oldest = db.query(AIChatHistory).filter(
                AIChatHistory.usuario_id == user_id
            ).order_by(AIChatHistory.criado_em.asc()).limit(total - 50).all()
            for old in oldest:
                db.delete(old)
        
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to store AI chat history: {e}")
        db.rollback()
    
    return {
        "response": result.get("response", ""),
        "suggestions": result.get("suggestions"),
        "exercises": result.get("exercises"),
    }


@router.get("/chat/history")
def get_ai_chat_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get FitBot conversation history for the current user"""
    user_id = current_user["user_id"]
    
    history = db.query(AIChatHistory).filter(
        AIChatHistory.usuario_id == user_id
    ).order_by(AIChatHistory.criado_em.asc()).limit(50).all()
    
    return [
        {
            "id": h.id,
            "role": h.role,
            "content": h.content,
            "criado_em": h.criado_em
        }
        for h in history
    ]


@router.delete("/chat/history")
def clear_ai_chat_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear FitBot conversation history"""
    user_id = current_user["user_id"]
    db.query(AIChatHistory).filter(AIChatHistory.usuario_id == user_id).delete()
    db.commit()
    return {"message": "Histórico limpo com sucesso"}


@router.get("/exercise-suggestions/{grupo_muscular}")
def get_exercise_suggestions(
    grupo_muscular: str,
    nivel: str = "intermediario",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get exercise suggestions by muscle group and level"""
    grupo_lower = grupo_muscular.lower()
    
    # Map common names
    grupo_map = {
        "chest": "peito", "peitoral": "peito",
        "back": "costas", "dorsal": "costas",
        "legs": "pernas", "quadriceps": "pernas", "leg": "pernas",
        "shoulders": "ombros", "shoulder": "ombros", "deltoid": "ombros",
        "arms": "bracos", "biceps": "bracos", "triceps": "bracos", "braço": "bracos",
    }
    
    grupo = grupo_map.get(grupo_lower, grupo_lower)
    
    if grupo not in EXERCISE_DB:
        available = list(EXERCISE_DB.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Grupo muscular não encontrado. Disponíveis: {', '.join(available)}"
        )
    
    exercises = EXERCISE_DB[grupo].get(nivel, EXERCISE_DB[grupo]["intermediario"])
    
    # Also get exercises from the database
    db_exercises = db.query(Exercicio).filter(
        Exercicio.grupo_muscular.ilike(f"%{grupo}%")
    ).all()
    
    return {
        "grupo_muscular": grupo,
        "nivel": nivel,
        "ai_suggestions": exercises,
        "database_exercises": [
            {
                "id": ex.id,
                "nome": ex.nome,
                "grupo_muscular": ex.grupo_muscular,
                "descricao": ex.descricao,
                "instrucoes": ex.instrucoes,
                "dicas": ex.dicas,
                "nivel": ex.nivel,
                "equipamento": ex.equipamento,
            }
            for ex in db_exercises
        ]
    }


@router.get("/training-plan")
def suggest_training_plan(
    objetivo: str = "hipertrofia",
    nivel: str = "intermediario",
    dias_semana: int = 4,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Suggest a complete training plan based on goals and availability"""
    splits = TRAINING_SPLITS.get(nivel, TRAINING_SPLITS["intermediario"])
    
    # Find best split for the number of days
    best_key = None
    for key in splits:
        num = int(key.split("_")[0])
        if num <= dias_semana:
            best_key = key
    
    if not best_key:
        best_key = list(splits.keys())[0]
    
    split = splits[best_key]
    
    # Build detailed plan
    plan = []
    for i, dia_nome in enumerate(split):
        dia_lower = dia_nome.lower()
        exercicios = []
        
        # Determine which muscle groups this day covers
        if "push" in dia_lower or "peito" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("peito", {}).get(nivel, [])[:3])
            if "push" in dia_lower:
                exercicios.extend(EXERCISE_DB.get("ombros", {}).get(nivel, [])[:2])
                exercicios.extend(EXERCISE_DB.get("bracos", {}).get(nivel, [])[-2:])  # triceps
        elif "pull" in dia_lower or "costas" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("costas", {}).get(nivel, [])[:4])
            if "pull" in dia_lower:
                exercicios.extend(EXERCISE_DB.get("bracos", {}).get(nivel, [])[:2])  # biceps
        elif "leg" in dia_lower or "perna" in dia_lower or "inferior" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("pernas", {}).get(nivel, []))
        elif "ombro" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("ombros", {}).get(nivel, []))
        elif "braço" in dia_lower or "bracos" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("bracos", {}).get(nivel, []))
        elif "full" in dia_lower or "superior" in dia_lower:
            exercicios.extend(EXERCISE_DB.get("peito", {}).get(nivel, [])[:2])
            exercicios.extend(EXERCISE_DB.get("costas", {}).get(nivel, [])[:2])
            if "full" in dia_lower:
                exercicios.extend(EXERCISE_DB.get("pernas", {}).get(nivel, [])[:2])
        
        plan.append({
            "dia": i + 1,
            "nome": dia_nome,
            "exercicios": exercicios
        })
    
    advice = GOAL_ADVICE.get(objetivo, GOAL_ADVICE["hipertrofia"])
    
    return {
        "objetivo": objetivo,
        "nivel": nivel,
        "dias_semana": dias_semana,
        "split": best_key.replace("_", " "),
        "plan": plan,
        "orientacoes": advice
    }
