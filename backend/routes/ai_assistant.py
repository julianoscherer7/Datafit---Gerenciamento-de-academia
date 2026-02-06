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
from models import Usuario, Exercicio, SerieExecutada, Treino, TreinoExercicio, CoachStudent, MedidaCorporal
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
    msg_lower = message.lower()
    
    # COACH CONTEXT: Training plan suggestions
    if context == "coach_training" or any(w in msg_lower for w in ["treino para", "montar treino", "plano de treino", "criar treino"]):
        # Detect level
        nivel = "intermediario"
        if any(w in msg_lower for w in ["iniciante", "começando", "novo"]):
            nivel = "iniciante"
        elif any(w in msg_lower for w in ["avançado", "avancado", "experiente", "pesado"]):
            nivel = "avancado"
        
        # Detect muscle group
        grupo = None
        if any(w in msg_lower for w in ["peito", "peitoral", "chest"]):
            grupo = "peito"
        elif any(w in msg_lower for w in ["costas", "dorsal", "back"]):
            grupo = "costas"
        elif any(w in msg_lower for w in ["perna", "quadríceps", "posterior", "legs"]):
            grupo = "pernas"
        elif any(w in msg_lower for w in ["ombro", "deltóide", "shoulder"]):
            grupo = "ombros"
        elif any(w in msg_lower for w in ["braço", "bíceps", "tríceps", "arms"]):
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
    if context == "exercise_suggestion" or any(w in msg_lower for w in ["exercício para", "exercicio para", "sugestão de exercício", "qual exercício"]):
        grupo = None
        for g in ["peito", "costas", "pernas", "ombros", "bracos"]:
            if g in msg_lower or (g == "bracos" and any(w in msg_lower for w in ["braço", "bíceps", "tríceps"])):
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
    if any(w in msg_lower for w in ["hipertrofia", "ganhar massa", "crescer", "volume muscular"]):
        advice = GOAL_ADVICE["hipertrofia"]
        response = f"🎯 **Protocolo para Hipertrofia**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}"
        return {"response": response}
    
    if any(w in msg_lower for w in ["emagrecer", "perder peso", "secar", "definir", "cutting"]):
        advice = GOAL_ADVICE["emagrecimento"]
        response = f"🔥 **Protocolo para Emagrecimento**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}"
        return {"response": response}
    
    if any(w in msg_lower for w in ["força", "forca", "powerlifting", "carga máxima"]):
        advice = GOAL_ADVICE["forca"]
        response = f"⚡ **Protocolo para Força**\n\n"
        response += f"📊 **Séries:** {advice['series']}\n"
        response += f"🔄 **Repetições:** {advice['reps']}\n"
        response += f"⏱️ **Descanso:** {advice['descanso']}\n"
        response += f"📅 **Frequência:** {advice['frequencia']}\n\n"
        response += f"💡 {advice['dica']}"
        return {"response": response}
    
    # NUTRITION CONTEXT
    if any(w in msg_lower for w in ["dieta", "nutrição", "alimentação", "calorias", "proteína", "macros"]):
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
    if any(w in msg_lower for w in ["suplemento", "creatina", "whey", "pré-treino", "bcaa"]):
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
    if any(w in msg_lower for w in ["descanso", "recovery", "recuperação", "overtraining", "dor muscular"]):
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
    
    # DEFAULT: General fitness help
    response = "👋 **Como posso ajudar?**\n\n"
    response += "Sou o assistente AI do DATAFIT. Posso ajudar com:\n\n"
    response += "🏋️ **Treinos** - Montar planos, sugerir exercícios\n"
    response += "🎯 **Objetivos** - Hipertrofia, emagrecimento, força\n"
    response += "🥗 **Nutrição** - Orientações sobre dieta e macros\n"
    response += "💊 **Suplementação** - Guia baseado em evidências\n"
    response += "😴 **Recuperação** - Descanso e prevenção de overtraining\n\n"
    response += "Tente perguntar algo como:\n"
    response += '• _"Montar treino de peito intermediário"_\n'
    response += '• _"Exercícios para costas avançado"_\n'
    response += '• _"Protocolo de hipertrofia"_\n'
    response += '• _"Dicas de nutrição"_'
    return {"response": response}


# ==================== ROUTES ====================

@router.post("/chat")
def ai_chat(
    data: AIAssistantRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-powered chat assistant for coaches and users"""
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
    
    result = generate_ai_response(data.message, data.context, student_data)
    
    return {
        "response": result.get("response", ""),
        "suggestions": result.get("suggestions"),
        "exercises": result.get("exercises"),
    }


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
