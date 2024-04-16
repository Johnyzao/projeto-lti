DROP TABLE IF EXISTS Licita;
DROP TABLE IF EXISTS Ganha;
DROP TABLE IF EXISTS Subscrever;
DROP TABLE IF EXISTS Leilao;
DROP TABLE IF EXISTS Regista;
DROP TABLE IF EXISTS Entrega;
DROP TABLE IF EXISTS Reclamado;
DROP TABLE IF EXISTS Dono;
DROP TABLE IF EXISTS Licitante;
DROP TABLE IF EXISTS Utilizador;
DROP TABLE IF EXISTS Encontrado;
DROP TABLE IF EXISTS Achado;
DROP TABLE IF EXISTS NaoAchado;
DROP TABLE IF EXISTS Localidade;
DROP TABLE IF EXISTS Objeto;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Policia;
DROP TABLE IF EXISTS Posto;


CREATE TABLE Utilizador (
    nif INT PRIMARY KEY,
    nic VARCHAR(20),
    nome VARCHAR(255) NOT NULL,
    genero TEXT NOT NULL,
    ano_nascimento DATE NOT NULL,
    telemovel TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    morada VARCHAR(255),
    tipo_conta TEXT NOT NULL,
    estado TEXT NOT NULL
)

CREATE TABLE Dono (
    nif INT PRIMARY KEY,
    FOREIGN KEY (nif) REFERENCES Utilizador(nif)
);

CREATE TABLE Licitante (
    nif INT PRIMARY KEY,
    FOREIGN KEY (nif) REFERENCES Utilizador(nif)
);

CREATE TABLE Localidade (
    id INT PRIMARY KEY,
    coordenadas VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    distrito VARCHAR(255) NOT NULL,
    municipio VARCHAR(255) NOT NULL,
    freguesia VARCHAR(255) NOT NULL,
    rua VARCHAR(255) NOT NULL
);

CREATE TABLE Categoria ( 
    nome VARCHAR(255) PRIMARY KEY,
    valor INT NOT NULL,
    tipo VARCHAR(100) NOT NULL
);

CREATE TABLE Objeto (
    id INT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    FOREIGN KEY (nome) REFERENCES Categoria(nome)
);

CREATE TABLE NaoAchado (
    id INT PRIMARY KEY,
    perdido_em INT NOT NULL,
    FOREIGN KEY (perdido_em) REFERENCES Localidade(id),
    FOREIGN KEY (id) REFERENCES Objeto(id)
);

CREATE TABLE Achado (
    id INT PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    achado_em INT NOT NULL,
    FOREIGN KEY (achado_em) REFERENCES Localidade(id),
    FOREIGN KEY (id) REFERENCES Objeto(id)
);

CREATE TABLE Encontrado (
    id_achado INT,
    id_nao_achado INT,
    PRIMARY KEY (id_achado, id_nao_achado),
    FOREIGN KEY (id_achado) REFERENCES Achado(id),
    FOREIGN KEY (id_nao_achado) REFERENCES NaoAchado(id)

);

CREATE TABLE Regista (
    nif INT,
    id INT,
    data DATE NOT NULL,
    data_fim DATE NOT NULL,
    PRIMARY KEY (nif, id),
    FOREIGN KEY (nif) REFERENCES Dono(nif),
    FOREIGN KEY (id) REFERENCES NaoAchado(id)
);

CREATE TABLE Reclamado (
    nif INT,
    id INT,
    data DATE NOT NULL,
    PRIMARY KEY (nif, id),
    FOREIGN KEY (nif) REFERENCES Dono(nif),
    FOREIGN KEY (id) REFERENCES Achado(id)
);

CREATE TABLE Posto (
    id INT PRIMARY KEY,
    codPostal VARCHAR(8) NOT NULL,
    morada VARCHAR(255) NOT NULL
);

CREATE TABLE Policia (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    posto INT NOT NULL,
    FOREIGN KEY (posto) REFERENCES Posto(id)
);

CREATE TABLE Entrega (
    nif INT,
    id_objeto INT,
    id_policia INT,
    data DATE NOT NULL,
    PRIMARY KEY (nif, id_objeto, id_policia),
    FOREIGN KEY (nif) REFERENCES Utilizador(nif),
    FOREIGN KEY (nif) REFERENCES Objeto(id),
    FOREIGN KEY (id_policia) REFERENCES Policia(id)
);

CREATE TABLE Leilao (
    id INT PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor INT NOT NULL,
    id_achado INT NOT NULL,
    FOREIGN KEY (id_achado) REFERENCES Achado(id)
);

CREATE TABLE Licita (
    nif INT,
    id_leilao INT,
    valor INT NOT NULL,
    data DATE NOT NULL,
    id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (nif) REFERENCES Licitante(nif),
    FOREIGN KEY (id_leilao) REFERENCES Leilao(id)
);

CREATE TABLE Ganha (
    nif INT,
    id_leilao INT,
    id_achado INT,
    PRIMARY KEY (nif, id_leilao, id_achado),
    FOREIGN KEY (nif) REFERENCES Licitante(nif),
    FOREIGN KEY (id_leilao) REFERENCES Leilao(id),
    FOREIGN KEY (id_achado) REFERENCES Achado(id)
);

CREATE TABLE Subscrever (
    nif INT,
    id_leilao INT,
    PRIMARY KEY (nif, id_leilao),
    FOREIGN KEY (nif) REFERENCES Licitante(nif),
    FOREIGN KEY (id_leilao) REFERENCES Leilao(id)
);
