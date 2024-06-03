DROP TABLE IF EXISTS Licita CASCADE;
DROP TABLE IF EXISTS Ganha CASCADE;
DROP TABLE IF EXISTS Subscrever CASCADE;
DROP TABLE IF EXISTS Leilao CASCADE;
DROP TABLE IF EXISTS Regista CASCADE;
DROP TABLE IF EXISTS Entrega CASCADE;
DROP TABLE IF EXISTS Reclamado CASCADE;
DROP TABLE IF EXISTS Dono CASCADE;
DROP TABLE IF EXISTS Licitante CASCADE;
DROP TABLE IF EXISTS Utilizador CASCADE;
DROP TABLE IF EXISTS Encontrado CASCADE;
DROP TABLE IF EXISTS Achado CASCADE;
DROP TABLE IF EXISTS Perdido CASCADE;
DROP TABLE IF EXISTS Localizacao CASCADE;
DROP TABLE IF EXISTS Objeto CASCADE;
DROP TABLE IF EXISTS Categoria CASCADE;
DROP TABLE IF EXISTS AtributoObjeto CASCADE;
DROP TABLE IF EXISTS NomeCategoria CASCADE;
DROP TABLE IF EXISTS Campo CASCADE;
DROP TABLE IF EXISTS Policia CASCADE;
DROP TABLE IF EXISTS Posto CASCADE;

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
    estado TEXT NOT NULL,
    removido INT
);

CREATE TABLE Posto (
    id INT PRIMARY KEY,
    codPostal VARCHAR(8) NOT NULL,
    morada VARCHAR(255) NOT NULL,
    localidade VARCHAR(255) NOT NULL,
    telefone VARCHAR(10) NOT NULL,
    removido INT
);

CREATE TABLE Policia (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    posto INT REFERENCES Posto(id),
    removido INT
);

CREATE TABLE NomeCategoria (
    nome VARCHAR(255) PRIMARY KEY
);

CREATE TABLE Campo (
    nome TEXT PRIMARY KEY,
    tipo_valor TEXT
);

CREATE TABLE Categoria (
    cat VARCHAR(255),
    campo TEXT,
    FOREIGN KEY (cat) REFERENCES NomeCategoria(nome),
    FOREIGN KEY (campo) REFERENCES Campo(nome),
    PRIMARY KEY (cat, campo)
);

CREATE TABLE Localizacao (
    id INT PRIMARY KEY,
    pais TEXT NOT NULL,
    dist TEXT NOT NULL,
    munc TEXT,
    freg TEXT,
    rua TEXT,
    morada TEXT,
    codp TEXT,
    coords TEXT
);

CREATE TABLE Objeto (
    id INT PRIMARY KEY,
    nifUser INT,
    descricao TEXT NOT NULL,
    titulo TEXT NOT NULL,
    imagens TEXT,
    dataRegisto TEXT,
    categoria VARCHAR(255),
    FOREIGN KEY (categoria) REFERENCES NomeCategoria(nome),
    FOREIGN KEY (nifUser) REFERENCES Utilizador(nif)
);

CREATE TABLE Dono (
    nif INT PRIMARY KEY,
    FOREIGN KEY (nif) REFERENCES Utilizador(nif)
);

CREATE TABLE Licitante (
    nif INT PRIMARY KEY,
    FOREIGN KEY (nif) REFERENCES Utilizador(nif)
);

CREATE TABLE Achado (
    id INT UNIQUE,
    idAchado INT UNIQUE,
    data_leilao TEXT NOT NULL,
    achado_em INT NOT NULL,
    policia INT,
    foundDate DATE,
    foundTime TEXT,
    foundDateInfLim DATE,
    foundDateSupLim DATE,
    removido INT,
    PRIMARY KEY (id, idAchado),
    FOREIGN KEY (policia) REFERENCES Policia(id),
    FOREIGN KEY (achado_em) REFERENCES Localizacao(id),
    FOREIGN KEY (id) REFERENCES Objeto(id)
);

CREATE TABLE Perdido (
    id INT UNIQUE,
    idPerdido INT UNIQUE,
    objetoAchado INT,
    perdido_em INT NOT NULL,
    lostDate DATE,
    lostTime TEXT,
    lostDateInfLim DATE,
    lostDateSupLim DATE,
    removido INT,
    PRIMARY KEY(id, idPerdido),
    FOREIGN KEY (objetoAchado) REFERENCES Achado(id),
    FOREIGN KEY (perdido_em) REFERENCES Localizacao(id),
    FOREIGN KEY (id) REFERENCES Objeto(id)
);

CREATE TABLE AtributoObjeto (
    idObj INT,
    campo TEXT,
    valor TEXT,
    FOREIGN KEY (idObj) REFERENCES Objeto(id),
    FOREIGN KEY (campo) REFERENCES Campo(nome),
    PRIMARY KEY (idObj, campo, valor)
);

CREATE TABLE Encontrado (
    id_achado INT,
    id_nao_achado INT,
    PRIMARY KEY (id_achado, id_nao_achado),
    FOREIGN KEY (id_achado) REFERENCES Achado(id),
    FOREIGN KEY (id_nao_achado) REFERENCES Perdido(id)
);

CREATE TABLE Regista (
    nif INT,
    id INT,
    data DATE NOT NULL,
    data_fim DATE NOT NULL,
    PRIMARY KEY (nif, id),
    FOREIGN KEY (nif) REFERENCES Dono(nif),
    FOREIGN KEY (id) REFERENCES Perdido(id)
);

CREATE TABLE Reclamado (
    nif INT,
    id INT,
    data DATE NOT NULL,
    PRIMARY KEY (nif, id),
    FOREIGN KEY (nif) REFERENCES Dono(nif),
    FOREIGN KEY (id) REFERENCES Achado(id)
);

CREATE TABLE Entrega (
    nif INT,
    id_objeto INT,
    id_policia INT,
    data DATE NOT NULL,
    PRIMARY KEY (nif, id_objeto, id_policia),
    FOREIGN KEY (nif) REFERENCES Utilizador(nif),
    FOREIGN KEY (id_objeto) REFERENCES Objeto(id),
    FOREIGN KEY (id_policia) REFERENCES Policia(id)
);

CREATE TABLE Leilao (
    id INT PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor INT NOT NULL,
    id_achado INT NOT NULL,
    removido INT,
    aberto INT,
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
    PRIMARY KEY (nif, id_leilao),
    FOREIGN KEY (nif) REFERENCES Licitante(nif),
    FOREIGN KEY (id_leilao) REFERENCES Leilao(id)
);

CREATE TABLE Subscrever (
    nif INT,
    id_leilao INT,
    removido INT,
    PRIMARY KEY (nif, id_leilao),
    FOREIGN KEY (nif) REFERENCES Licitante(nif),
    FOREIGN KEY (id_leilao) REFERENCES Leilao(id)
);
