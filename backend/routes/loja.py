from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import ItemLoja, ItemUsuario, UsuarioProgresso, Recompensa
from security import get_current_user

router = APIRouter(prefix="/loja", tags=["loja"])

# Schemas
class ItemLojaResponse(BaseModel):
    id: int
    codigo: str
    nome: str
    descricao: Optional[str]
    tipo: str
    preco_moedas: int
    icone: Optional[str]
    raridade: str
    disponivel: bool
    comprado: bool = False
    equipado: bool = False
    
    class Config:
        from_attributes = True

class CompraResponse(BaseModel):
    success: bool
    message: str
    moedas_restantes: int
    item: Optional[ItemLojaResponse]

class ProgressoResponse(BaseModel):
    moedas: int
    xp_total: int
    nivel: int
    titulo_atual: str
    borda_atual: Optional[str]
    tema_atual: str
    treinos_validados: int
    
    class Config:
        from_attributes = True

# Rotas
@router.get("/itens", response_model=List[ItemLojaResponse])
async def listar_itens(
    tipo: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todos os itens disponíveis na loja"""
    
    query = db.query(ItemLoja).filter(ItemLoja.disponivel == True)
    
    if tipo:
        query = query.filter(ItemLoja.tipo == tipo)
    
    itens = query.all()
    
    # Verificar quais o usuário já comprou
    itens_comprados = db.query(ItemUsuario).filter(
        ItemUsuario.usuario_id == current_user["id"]
    ).all()
    
    comprados_dict = {item.item_id: item.equipado for item in itens_comprados}
    
    return [
        ItemLojaResponse(
            id=item.id,
            codigo=item.codigo,
            nome=item.nome,
            descricao=item.descricao,
            tipo=item.tipo,
            preco_moedas=item.preco_moedas,
            icone=item.icone,
            raridade=item.raridade,
            disponivel=item.disponivel,
            comprado=item.id in comprados_dict,
            equipado=comprados_dict.get(item.id, False)
        ) for item in itens
    ]

@router.post("/comprar/{item_id}", response_model=CompraResponse)
async def comprar_item(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compra um item da loja"""
    
    # Verificar se o item existe
    item = db.query(ItemLoja).filter(
        ItemLoja.id == item_id,
        ItemLoja.disponivel == True
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    # Verificar se já comprou
    ja_comprou = db.query(ItemUsuario).filter(
        ItemUsuario.usuario_id == current_user["id"],
        ItemUsuario.item_id == item_id
    ).first()
    
    if ja_comprou:
        raise HTTPException(status_code=400, detail="Você já possui este item")
    
    # Verificar moedas
    progresso = _get_or_create_progresso(db, current_user["id"])
    
    if progresso.moedas < item.preco_moedas:
        return CompraResponse(
            success=False,
            message=f"Moedas insuficientes. Você tem {progresso.moedas}, precisa de {item.preco_moedas}",
            moedas_restantes=progresso.moedas,
            item=None
        )
    
    # Realizar compra
    progresso.moedas -= item.preco_moedas
    
    novo_item = ItemUsuario(
        usuario_id=current_user["id"],
        item_id=item_id,
        equipado=False
    )
    
    db.add(novo_item)
    db.commit()
    
    return CompraResponse(
        success=True,
        message=f"Item '{item.nome}' comprado com sucesso!",
        moedas_restantes=progresso.moedas,
        item=ItemLojaResponse(
            id=item.id,
            codigo=item.codigo,
            nome=item.nome,
            descricao=item.descricao,
            tipo=item.tipo,
            preco_moedas=item.preco_moedas,
            icone=item.icone,
            raridade=item.raridade,
            disponivel=item.disponivel,
            comprado=True,
            equipado=False
        )
    )

@router.post("/equipar/{item_id}")
async def equipar_item(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Equipa um item comprado"""
    
    # Verificar se possui o item
    item_usuario = db.query(ItemUsuario).filter(
        ItemUsuario.usuario_id == current_user["id"],
        ItemUsuario.item_id == item_id
    ).first()
    
    if not item_usuario:
        raise HTTPException(status_code=404, detail="Você não possui este item")
    
    # Buscar o item para saber o tipo
    item = db.query(ItemLoja).filter(ItemLoja.id == item_id).first()
    
    # Desequipar outros itens do mesmo tipo
    db.query(ItemUsuario).filter(
        ItemUsuario.usuario_id == current_user["id"],
        ItemUsuario.item_id.in_(
            db.query(ItemLoja.id).filter(ItemLoja.tipo == item.tipo)
        )
    ).update({"equipado": False}, synchronize_session=False)
    
    # Equipar o item
    item_usuario.equipado = True
    
    # Atualizar progresso do usuário
    progresso = _get_or_create_progresso(db, current_user["id"])
    
    if item.tipo == "borda":
        progresso.borda_atual = item.codigo
    elif item.tipo == "tema":
        progresso.tema_atual = item.codigo
    elif item.tipo == "titulo":
        progresso.titulo_atual = item.nome
    
    db.commit()
    
    return {"success": True, "message": f"Item '{item.nome}' equipado!"}

@router.get("/meus-itens", response_model=List[ItemLojaResponse])
async def listar_meus_itens(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista itens que o usuário possui"""
    
    itens = db.query(ItemLoja, ItemUsuario).join(
        ItemUsuario, ItemLoja.id == ItemUsuario.item_id
    ).filter(
        ItemUsuario.usuario_id == current_user["id"]
    ).all()
    
    return [
        ItemLojaResponse(
            id=item.id,
            codigo=item.codigo,
            nome=item.nome,
            descricao=item.descricao,
            tipo=item.tipo,
            preco_moedas=item.preco_moedas,
            icone=item.icone,
            raridade=item.raridade,
            disponivel=item.disponivel,
            comprado=True,
            equipado=item_usuario.equipado
        ) for item, item_usuario in itens
    ]

@router.get("/progresso", response_model=ProgressoResponse)
async def get_progresso(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna progresso do usuário (moedas, XP, nível)"""
    
    progresso = _get_or_create_progresso(db, current_user["id"])
    
    return ProgressoResponse(
        moedas=progresso.moedas,
        xp_total=progresso.xp_total,
        nivel=progresso.nivel,
        titulo_atual=progresso.titulo_atual,
        borda_atual=progresso.borda_atual,
        tema_atual=progresso.tema_atual,
        treinos_validados=progresso.treinos_validados
    )

@router.get("/recompensas")
async def listar_recompensas(
    db: Session = Depends(get_db)
):
    """Lista todas as recompensas disponíveis"""
    
    recompensas = db.query(Recompensa).filter(Recompensa.ativo == True).all()
    
    return [
        {
            "acao": r.acao,
            "moedas": r.moedas,
            "xp": r.xp,
            "descricao": r.descricao
        } for r in recompensas
    ]

# Funções auxiliares
def _get_or_create_progresso(db: Session, usuario_id: int) -> UsuarioProgresso:
    progresso = db.query(UsuarioProgresso).filter(
        UsuarioProgresso.usuario_id == usuario_id
    ).first()
    
    if not progresso:
        progresso = UsuarioProgresso(usuario_id=usuario_id)
        db.add(progresso)
        db.commit()
        db.refresh(progresso)
    
    return progresso
