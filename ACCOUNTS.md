# 🔐 Credenciais de Teste - Datafit

## 📋 Índice
- [Administração](#administração)
- [Coaches (Instrutores)](#coaches-instrutores)
- [Alunos](#alunos)

---

## 👤 Administração

### Admin
- **Email:** `admin@fitdata.com`
- **Senha:** `Admin@123`
- **Perfil:** Administrador
- **Status:** ⚪ BÁSICO

---

## 👨‍🏫 Coaches (Instrutores)

### Coach Carlos (Upado)
- **Email:** `coach@fitdata.com`
- **Senha:** `Coach@123`
- **CREF:** 012345-G/SP
- **Status:** ✅ Aprovado
- **Código de Convite:** `C4RL0S`
- **Alunos:** 2 (Maria, João)
- **Nível:** 🔥 **UPADO**

### Ana Santos (Upada)
- **Email:** `ana@fitdata.com`
- **Senha:** `Ana@123`
- **CREF:** 078945-G/RJ
- **Especialidade:** Funcional e Condicionamento Físico
- **Status:** ✅ Aprovado
- **Código de Convite:** `ANA123`
- **Alunos:** 4 (Rodrigo, Lucas, Camila, Rafael)
- **Treinos Criados:** 3
- **Amigos:** 3 (Lucas, Camila, Rafael)
- **Nível:** 🔥🔥 **MUITO UPADO**

### Bruno Lima (Zerado)
- **Email:** `bruno@fitdata.com`
- **Senha:** `Bruno@123`
- **CREF:** 123456-G/MG
- **Especialidade:** Musculação e Reabilitação
- **Status:** ✅ Aprovado
- **Código de Convite:** `BRUN0X`
- **Alunos:** 0
- **Treinos:** 0
- **Nível:** ⚪ **ZERADO** (novo, sem alunos nem treinos)

---

## 🏋️ Alunos

### João (Usuário Principal)
- **Email:** `usuario@fitdata.com`
- **Senha:** `Usuario@123`
- **Level:** 2
- **XP:** 500
- **Moedas:** 100
- **Coach:** Carlos
- **Status:** ⚪ **BÁSICO**

### Maria Santos (Conta DEMO - Recomendada) ⭐
- **Email:** `maria@fitdata.com`
- **Senha:** `Maria@123`
- **Level:** 8
- **XP:** 4.200
- **Moedas:** 850
- **Título:** Guerreira Fitness
- **Streak:** 15 dias
- **Treinos:** 4 treinos completos
- **Badges:** 5 badges conquistados
- **Medidas:** Histórico de evolução completo
- **Coach:** Carlos
- **Amigos:** João, Pedro
- **Status:** 🔥 **UPADO** (melhor conta para testar recursos)

### Pedro Costa
- **Email:** `pedro@fitdata.com`
- **Senha:** `Pedro@123`
- **Level:** 2
- **XP:** 500
- **Moedas:** 100
- **Amigos:** João, Maria
- **Status:** ⚪ **BÁSICO**

### Rodrigo Alves (Avançado)
- **Email:** `rodrigo@fitdata.com`
- **Senha:** `Rodrigo@123`
- **Level:** 15 ⭐
- **XP:** 12.500
- **Moedas:** 2.500
- **Título:** Lenda do Ferro
- **Streak:** 45 dias 🔥
- **Badges:** TODAS desbloqueadas
- **Coach:** Ana
- **Status:** 🔥🔥🔥 **MUITO UPADO** (level máximo, todas badges)

### Lucas Ferreira (Aluno da Ana - Upado)
- **Email:** `lucas@fitdata.com`
- **Senha:** `Lucas@123`
- **Level:** 12
- **XP:** 8.500
- **Moedas:** 1.500
- **Título:** Guerreiro de Ferro
- **Streak:** 30 dias
- **Coach:** Ana
- **Amigo de:** Ana (coach)
- **Status:** 🔥🔥 **UPADO**

### Camila Duarte (Aluna da Ana - Nova)
- **Email:** `camila@fitdata.com`
- **Senha:** `Camila@123`
- **Level:** 2
- **XP:** 200
- **Moedas:** 50
- **Título:** Iniciante
- **Streak:** 0
- **Coach:** Ana
- **Amigo de:** Ana (coach)
- **Status:** ⚪ **BÁSICO** (iniciante)

### Rafael Souza (Aluno da Ana - Upado)
- **Email:** `rafael@fitdata.com`
- **Senha:** `Rafael@123`
- **Level:** 12
- **XP:** 8.500
- **Moedas:** 1.500
- **Título:** Guerreiro de Ferro
- **Streak:** 30 dias
- **Coach:** Ana
- **Amigo de:** Ana (coach)
- **Status:** 🔥🔥 **UPADO**

---

## 📊 Resumo por Nível

### ⚪ BÁSICO (Contas novas/simples)
- Admin
- João (usuario@fitdata.com)
- Pedro (pedro@fitdata.com)
- Camila (camila@fitdata.com)
- Bruno - coach zerado (bruno@fitdata.com)

### 🔥 UPADO (Contas com histórico)
- Carlos - coach (coach@fitdata.com)
- Maria ⭐ RECOMENDADA (maria@fitdata.com)

### 🔥🔥 MUITO UPADO (Contas avançadas)
- Ana - coach (ana@fitdata.com)
- Lucas (lucas@fitdata.com)
- Rafael (rafael@fitdata.com)

### 🔥🔥🔥 EXTREMAMENTE UPADO (Level máximo)
- Rodrigo (rodrigo@fitdata.com)

---

## 🎯 Recomendações para Teste

1. **Para testar recursos de aluno:** Use `maria@fitdata.com` (conta demo completa)
2. **Para testar coach experiente:** Use `ana@fitdata.com` (4 alunos, treinos)
3. **Para testar coach novo:** Use `bruno@fitdata.com` (sem alunos, pronto para começar)
4. **Para testar level alto:** Use `rodrigo@fitdata.com` (level 15, todas badges)
5. **Para testar amizades:** Use `ana@fitdata.com` (tem 3 amigos já conectados)

---

## 🔄 Para Resetar o Banco de Dados

```bash
cd backend
source ../.venv-1/bin/activate
DB_ENGINE=sqlite python seed.py
```

---

**Última atualização:** 10 de fevereiro de 2026
