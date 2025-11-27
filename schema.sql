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
