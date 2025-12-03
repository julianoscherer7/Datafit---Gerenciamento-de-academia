-- FITDATA: esquema SQL (MySQL) - Versão Simplificada
-- Observação: este script cria o banco de dados `fitdata_dev` e todas as tabelas.
-- No phpMyAdmin você pode colar todo o conteúdo na aba SQL e executar (não precisa selecionar um BD antes).

CREATE DATABASE IF NOT EXISTS `fitdata_dev`
  DEFAULT CHARACTER SET = utf8mb4
  DEFAULT COLLATE = utf8mb4_unicode_ci;
USE `fitdata_dev`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS medidas_corporais;
DROP TABLE IF EXISTS series_executadas;
DROP TABLE IF EXISTS treinos_atribuidos;
DROP TABLE IF EXISTS treino_exercicios;
DROP TABLE IF EXISTS treinos;
DROP TABLE IF EXISTS exercicios;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(256) NOT NULL,
  perfil ENUM('aluno','instrutor','admin') NOT NULL DEFAULT 'aluno',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE exercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  grupo_muscular VARCHAR(80),
  descricao TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX (grupo_muscular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE treinos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  criado_por INT NULL, -- referencia a usuarios.id (instrutor)
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_treinos_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE treino_exercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treino_id INT NOT NULL,
  exercicio_id INT NOT NULL,
  `ordem` INT NOT NULL DEFAULT 1,
  series_sugeridas VARCHAR(50),
  reps_sugeridas VARCHAR(50),
  CONSTRAINT fk_te_ex_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_te_ex_exercicio FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX (treino_id),
  INDEX (exercicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE treinos_atribuidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treino_id INT NOT NULL,
  aluno_id INT NOT NULL, -- referencia a usuarios.id (perfil = aluno)
  data_atribuicao DATE NOT NULL DEFAULT CURRENT_DATE,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  observacao VARCHAR(255),
  CONSTRAINT fk_ta_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ta_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX (aluno_id),
  INDEX (treino_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE series_executadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,                       -- usuario que executou
  treino_id INT NULL,                          -- treino relacionado (pode ser NULL)
  exercicio_id INT NOT NULL,
  data_execucao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  serie_num INT NOT NULL DEFAULT 1,
  repeticoes INT NOT NULL,
  carga_kg DECIMAL(6,2) DEFAULT 0.00,
  observacao TEXT,
  CONSTRAINT fk_se_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_se_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_se_exercicio FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX (aluno_id),
  INDEX (exercicio_id),
  INDEX (data_execucao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE medidas_corporais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  data_medida DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_kg DECIMAL(6,2),
  braco_cm DECIMAL(6,2),
  cintura_cm DECIMAL(6,2),
  abdomen_cm DECIMAL(6,2),
  peito_cm DECIMAL(6,2),
  gordura_percent DECIMAL(5,2),
  foto_url VARCHAR(255),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mc_aluno FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX (aluno_id),
  INDEX (data_medida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gamification: tabelas adicionais para FITDATA

CREATE TABLE desafios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  tipo ENUM('series','tempo','volume','custom') NOT NULL DEFAULT 'custom',
  alvo_valor DECIMAL(10,2) NULL, -- ex: 20 (min) ou 1000 (kg)
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_desafios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  desafio_id INT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
  data_conclusao DATETIME NULL,
  progresso DECIMAL(10,2) DEFAULT 0, -- valor atual do progresso
  concluido TINYINT(1) DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (desafio_id) REFERENCES desafios(id) ON DELETE CASCADE,
  INDEX (usuario_id),
  INDEX (desafio_id),
  INDEX (concluido)
);

CREATE TABLE streaks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  inicio DATE NOT NULL,
  atual INT NOT NULL DEFAULT 0, -- dias consecutivos
  ultimo_dia DATE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(usuario_id)
);

CREATE TABLE badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(80) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  icone_url VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  badge_id INT NOT NULL,
  adquirido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, badge_id)
);

CREATE TABLE amizades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitante_id INT NOT NULL,
  solicitado_id INT NOT NULL,
  status ENUM('pendente','aceito','rejeitado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (solicitado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(solicitante_id, solicitado_id)
);

CREATE TABLE notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(80),
  titulo VARCHAR(150),
  mensagem TEXT,
  lida TINYINT(1) DEFAULT 0,
  meta JSON NULL, -- dados extras (ex: { "desafio_id": 1 })
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX (usuario_id),
  INDEX (lida)
);

CREATE TABLE leaderboard_semanal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semana_ano VARCHAR(20) NOT NULL, -- ex: "2024-W48"
  usuario_id INT NOT NULL,
  pontos INT DEFAULT 0,
  criterio VARCHAR(50), -- ex: 'volume','treinos'
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(semana_ano, usuario_id, criterio)
);

