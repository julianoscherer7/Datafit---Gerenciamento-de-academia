from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from models import (
    Usuario, Desafio, UsuarioDesafio, Streak, Badge, UsuarioBadge,
    SerieExecutada, Exercicio, TreinoAtribuido, Treino, MedidaCorporal
)
from decimal import Decimal
from sqlalchemy import func

def atualizar_progresso_desafio(db: Session, usuario_id: int, desafio_id: int, valor_adicionado: float):
    """Atualiza progresso de desafio do usuário"""
    usuario_desafio = db.query(UsuarioDesafio).filter(
        UsuarioDesafio.usuario_id == usuario_id,
        UsuarioDesafio.desafio_id == desafio_id,
        UsuarioDesafio.concluido == False
    ).first()
    
    if usuario_desafio:
        desafio = db.query(Desafio).filter(Desafio.id == desafio_id).first()
        usuario_desafio.progresso = float(usuario_desafio.progresso or 0) + valor_adicionado
        
        # Verifica se completou o desafio
        if desafio.alvo_valor and usuario_desafio.progresso >= float(desafio.alvo_valor):
            usuario_desafio.concluido = True
            usuario_desafio.data_conclusao = datetime.utcnow()
            conceder_badge_automatica(db, usuario_id, "desafio_completo")
        
        db.commit()

def atualizar_streak(db: Session, usuario_id: int):
    """Atualiza streak do usuário"""
    hoje = date.today()
    streak = db.query(Streak).filter(Streak.usuario_id == usuario_id).first()
    
    if not streak:
        streak = Streak(usuario_id=usuario_id, inicio=hoje, atual=1, ultimo_dia=hoje)
        db.add(streak)
    else:
        # Se treinou ontem ou hoje, continua streak
        if streak.ultimo_dia:
            diff = (hoje - streak.ultimo_dia).days
            if diff == 1:
                streak.atual += 1
            elif diff > 1:
                streak.atual = 1
                streak.inicio = hoje
        
        streak.ultimo_dia = hoje
    
    db.commit()
    return streak.atual

def conceder_badge_automatica(db: Session, usuario_id: int, codigo_badge: str) -> bool:
    """Concede badge automaticamente se não tiver"""
    badge = db.query(Badge).filter(Badge.codigo == codigo_badge).first()
    
    if not badge:
        return False
    
    # Verifica se já tem a badge
    ja_tem = db.query(UsuarioBadge).filter(
        UsuarioBadge.usuario_id == usuario_id,
        UsuarioBadge.badge_id == badge.id
    ).first()
    
    if not ja_tem:
        user_badge = UsuarioBadge(usuario_id=usuario_id, badge_id=badge.id)
        db.add(user_badge)
        db.commit()
        return True
    
    return False

def calcular_volume_total(db: Session, usuario_id: int, dias: int = 30) -> float:
    """Calcula volume total (kg x reps) dos últimos N dias"""
    data_inicio = date.today() - timedelta(days=dias)
    
    series = db.query(
        func.sum(SerieExecutada.carga_kg * SerieExecutada.repeticoes).label("volume")
    ).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= data_inicio
    ).first()
    
    return float(series.volume or 0)

def calcular_frequencia_semanal(db: Session, usuario_id: int) -> int:
    """Calcula quantos dias treinou nessa semana"""
    inicio_semana = date.today() - timedelta(days=date.today().weekday())
    
    dias = db.query(
        func.count(func.distinct(func.date(SerieExecutada.data_execucao))).label("dias")
    ).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= inicio_semana
    ).first()
    
    return dias.dias or 0

def calcular_progressao(db: Session, usuario_id: int, exercicio_id: int, dias: int = 30) -> dict:
    """Calcula progressão de carga de um exercício"""
    data_inicio = date.today() - timedelta(days=dias)
    
    series = db.query(SerieExecutada).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.exercicio_id == exercicio_id,
        SerieExecutada.data_execucao >= data_inicio
    ).order_by(SerieExecutada.data_execucao).all()
    
    if not series:
        return {"inicial": 0, "final": 0, "progresso_pct": 0}
    
    carga_inicial = float(series[0].carga_kg or 0)
    carga_final = float(series[-1].carga_kg or 0)
    
    progresso_pct = 0
    if carga_inicial > 0:
        progresso_pct = ((carga_final - carga_inicial) / carga_inicial) * 100
    
    return {
        "inicial": carga_inicial,
        "final": carga_final,
        "progresso_pct": round(progresso_pct, 2)
    }

def calcular_distribuicao_muscular(db: Session, usuario_id: int, dias: int = 30) -> dict:
    """Calcula volume por grupo muscular"""
    data_inicio = date.today() - timedelta(days=dias)
    
    resultado = db.query(
        Exercicio.grupo_muscular,
        func.sum(SerieExecutada.carga_kg * SerieExecutada.repeticoes).label("volume")
    ).join(
        SerieExecutada, SerieExecutada.exercicio_id == Exercicio.id
    ).filter(
        SerieExecutada.aluno_id == usuario_id,
        SerieExecutada.data_execucao >= data_inicio
    ).group_by(Exercicio.grupo_muscular).all()
    
    distribuicao = {}
    for grupo, volume in resultado:
        distribuicao[grupo or "Outros"] = float(volume or 0)
    
    return distribuicao

def obter_exercicios_favoritos(db: Session, usuario_id: int, limite: int = 5) -> list:
    """Retorna exercícios mais executados"""
    favoritos = db.query(
        Exercicio.id,
        Exercicio.nome,
        func.count(SerieExecutada.id).label("vezes")
    ).join(
        SerieExecutada, SerieExecutada.exercicio_id == Exercicio.id
    ).filter(
        SerieExecutada.aluno_id == usuario_id
    ).group_by(Exercicio.id).order_by(
        func.count(SerieExecutada.id).desc()
    ).limit(limite).all()
    
    return [
        {"id": ex[0], "nome": ex[1], "vezes": ex[2]} for ex in favoritos
    ]

def obter_ultimos_treinos(db: Session, usuario_id: int, limite: int = 5) -> list:
    """Retorna últimos treinos executados"""
    treinos = db.query(TreinoAtribuido).filter(
        TreinoAtribuido.aluno_id == usuario_id
    ).order_by(TreinoAtribuido.data_atribuicao.desc()).limit(limite).all()
    
    return [
        {
            "id": t.id,
            "treino_id": t.treino_id,
            "data": t.data_atribuicao.isoformat() if t.data_atribuicao else None,
            "ativo": t.ativo
        }
        for t in treinos
    ]

def obter_badges_recentes(db: Session, usuario_id: int, limite: int = 5) -> list:
    """Retorna badges recentes do usuário"""
    badges = db.query(UsuarioBadge, Badge).join(
        Badge, Badge.id == UsuarioBadge.badge_id
    ).filter(
        UsuarioBadge.usuario_id == usuario_id
    ).order_by(UsuarioBadge.adquirido_em.desc()).limit(limite).all()
    
    return [
        {
            "id": b.Badge.id,
            "codigo": b.Badge.codigo,
            "nome": b.Badge.nome,
            "descricao": b.Badge.descricao,
            "icone_url": b.Badge.icone_url,
            "adquirido_em": b.UsuarioBadge.adquirido_em.isoformat()
        }
        for b in badges
    ]
