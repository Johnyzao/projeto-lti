const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors')
const validator = require('validator');
const jwt = require('jsonwebtoken');

const dbClient = require('./connect_db');
const queries = require('./utils/queries');
const locationDB = require('./persistent/locationDB');
const categoryDB = require('./persistent/categoryDB');
const objectDB = require('./persistent/objectDB');
//const lostObjectDB = require('./persistent/lostObjectDB');

const { HttpException } = require('./utils/HttpException');
app.use(cookieParser());
app.use(cors());

app.use(express.json({ limit: '50mb' }));

//Função para encriptar a password do utilizador
async function passHash(password) {
    try {
        // [Salting] 
        // -técnica de segurança que adiciona uma string aleatória (salt) 
        //  à senha antes de aplicar o algoritmo de hash. 
        // [Salt rounds] 
        // - número de interações do algoritmo de hashing
        // - quantas mais salt rounds ->  + segurança && - performance
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error("Erro ao gerar hash: " + error);
    }
}

//Função para validar os dados de registo
function validateData(data) {

    const validacaoDados = {
        nome: validator.isAlpha(data.nome),
        mail: validator.isEmail(data.mail),
        telemovel: validator.isMobilePhone(data.telemovel.toString(), "pt-PT") || data.telemovel === "", //Ex: +351911234567
        pass: validator.isStrongPassword(data.pass),
        nif: data.nif.toString().length == 9, //validator.isVat() so aceita entradas do tipo PT123456789
        nic: validator.isNumeric(data.nic.toString()) && data.nic.toString().length === 9 || data.nic === "",
        gen: data.gen === "Masculino" || data.gen === "Feminino" || data.gen === "Outro" || data.gen === "Prefiro não dizer",
        //morada: null,
        dnasc: validator.isDate(data.dnasc)
    }

    return validacaoDados;
}

// TODO: Por testar...
async function obterId(nomeTabela) {
    let queryId = {
        text: "SELECT * FROM " + nomeTabela
    };

    let todasAsEntradas = await dbClient.query(queryId);
    let novoId = 1;
    
    todasAsEntradas.rows.forEach( entrada => {
        if ( novoId < entrada.id ) {
            novoId = entrada.id;
        }

        if ( novoId === entrada.id ) {
            novoId += 1;
        }
    })

    return novoId;
}

app.post("/register", async (req, res) => {
    try {
        // ###########################################################
        // #### 1. Validação e limpeza de dados; Hashing da pass. ####
        // ###########################################################

        //Objeto com informação para o front-end
        const statusMessage = {};
        //Objeto com cópia da receção do pedido
        const parametros = { ...req.body }

        //Validação de dados
        const validacaoDados = validateData(parametros);

        //Se algum dado falhar a validação
        if (Object.values(validacaoDados).some(value => value === false)) {
            //console.log(validacaoDados);
            //const errosDetetados = Object.keys(validacaoDados).filter(key => !validacaoDados[key]);
            //res.status(400).send();
        }

        //Limpeza de caracteres
        Object.keys(parametros).forEach((key) => {
            if (typeof parametros[key] === "string") {
                parametros[key] = validator.escape(validator.trim(parametros[key]));
            }
        });
        //Hash da password
        parametros.pass = await passHash(parametros.pass);
        console.log(parametros)

        // #######################################
        // #### 2. Inserção na base de dados. ####
        // #######################################
        const { nif, nic, nome, gen, dnasc, telemovel, mail, pass, morada } = parametros
        //Query parametrizada que regista um utilizador
        const queryRegisto = {
            name: 'register-user',
            text: 'INSERT INTO utilizador(nif, nic, nome, genero, ano_nascimento, telemovel, email, password, morada, tipo_conta, estado) \
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            values: [parseInt(nif), nic, nome, gen, dnasc, telemovel, mail, pass, morada, "u", "a"]
        }

        const results = dbClient.query(queryRegisto);
        //Se não encontrar resultados
        if ((await results).rowCount === 0) {
            //statusMessage.faltaRecurso = true;
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) { //Se a query ou o servidor falharem
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                //const constraintTypes = {
                //    utilizador_nif_pkey: "userDuplicado",
                //    unique_mail_constraint: "mailDuplicado",
                //    unique_nic_constraint: "nicDuplicado",
                //    unique_phone_constraint: "telemovelDuplicado"
                //}   
                //onst constraintType = constraintTypes[error.constraint];
                //statusMessage[constraintType] = true;
                res.status(409).send();
                return;

            case '23502': //<NOT NULL> error
                //const notNullErrors = {
                //    nic: 'notNullnic',
                //    nif: 'notNullnif',
                //    email: 'notNullmail',
                //    nome: 'notNullnome',
                //    dnasc: 'notNulldnasc',
                //    telemovel: 'notNulltelemovel',
                //    password: 'notNullpass',
                //    genero: 'notNullgen'
                //};
                //const errorType = notNullErrors[error.column];
                //statusMessage[errorType] = true
                res.status(422).send();
                return;

            default: //Outros tipos de erros
                res.status(500).send();
                return;
            //statusMessage.erroInterno = true
        }
    }

});

// TODO: Funcionar com contas de policia...
// TODO: Fazer jwt...
app.post("/login", async (req, res) => {
    try {
        const { mail, pass } = req.body;

        const queryLogin = {
            name: "login",
            text: "SELECT * FROM utilizador WHERE email = $1",
            values: [mail]
        };

        let results = await dbClient.query(queryLogin);
        let existeUtilizador = results.rowCount === 1 ? true : false;
        let passwordCorreta = await bcrypt.compare(pass, results.rows[0].password);
        let autenticar = existeUtilizador && passwordCorreta;

        if (autenticar) {
            res.status(200).send({
                nif: results.rows[0].nif,
                nome: results.rows[0].nome,
                mail: results.rows[0].email,
                estado: results.rows[0].estado,
                tipo: results.rows[0].tipo_conta
            });
        } else {
            res.status(401).send();
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no /login " + error);
        return;
    }
});

app.post("/user/:nif/verifyPassword", async (req, res) => {
    try {
        let { pass } = req.body;

        const queryVerificarPass = {
            name: "verify-password",
            text: "SELECT * FROM utilizador WHERE nif = $1",
            values: [req.params.nif]
        };

        let results = await dbClient.query(queryVerificarPass);
        let existeUtilizador = results.rowCount === 1 ? true : false;

        if (existeUtilizador) {
            let passwordCorreta = await bcrypt.compare(pass, results.rows[0].password);
            let autenticar = existeUtilizador && passwordCorreta;

            if (autenticar) {
                res.status(200).send();
            } else {
                res.status(401).send();
            }

        } else {
            res.status(404).send();
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no /login " + error);
        return;
    }
});

app.put("/user", async (req, res) => {
    try {
        let resultado = await dbClient.query(queries.queryUpdateUser(req.body));
        let userAtualizado = resultado.rowCount === 1 ? true : false;

        if (userAtualizado) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no PUT /user " + error);
    }
});

app.delete("/user/:userNif", async (req, res) => {
    try {

        const nif = req.params.userNif;
        const queryApagarUser = queries.queryDeleteUser(nif);
        const row = await dbClient.query(queryApagarUser);

        if (row.rowCount == 0) {
            res.status(404).send()
            return;
        }

        res.status(200).send();

    } catch (error) {
        res.status(500).send();
        console.log("Erro no DELETE /user " + error);
    }
});

app.put("/user/:userNif/deactivate", async (req, res) => {
    try {
        const nif = req.params.userNif;

        const queryDesativarUser = queries.queryDeactivateUser(nif);
        const row = await dbClient.query(queryDesativarUser);

        if (row.rowCount == 0) {
            res.status(404).send();
            return;
        }

        res.status(200).send();

    } catch (error) {
        res.status(500).send();
        console.log("Erro no /deactivate " + error);
    }
});

app.post("/searchUsers", async (req, res) => {
    try{
        let { nome, telemovel, mail, dnasc, genero } = req.body;

        let textoQuery = "SELECT * FROM utilizador WHERE ";

        if ( nome === "" ) {
            nome = "%";
        } else {
            nome += "%";
        }

        if ( telemovel === "" ) {
            telemovel = "%";
        } else {
            telemovel += "%";
        }

        if ( mail === "" ) {
            mail = "%";
        } else {
            mail += "%";
        }

        if ( genero === "" ) {
            genero = "%";
        }

        const queryProcurarUsers = {
            text: "SELECT * FROM utilizador WHERE nome LIKE $1 AND telemovel LIKE $2 AND email LIKE $3 AND genero LIKE $4",
            values: [nome, telemovel,mail,genero]
        }
        let result = await dbClient.query(queryProcurarUsers);

        if ( result.rowCount > 0 ) {
            res.status(200).send( {resultados: result.rows} );
        } else {
            res.status(404).send();
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no DELETE /user " + error);
    }
});

app.post("/police", async (req, res) => {
    let { id, nome, pass, posto } = req.body;

    let querySelectPolicia = {
        text: "SELECT * FROM policia WHERE id=$1",
        values: [id]
    }

    let resultsDuplicado = await dbClient.query(querySelectPolicia);
    if (resultsDuplicado.rowCount === 1) {
        res.status(401).send();
    } else {
        let queryInsertPolicia = {
            text: "INSERT INTO policia(id, nome, password, posto, removido) VALUES($1, $2, $3, $4, $5)",
            values: [id, nome, pass, posto, 0]
        }

        let results = await dbClient.query(queryInsertPolicia);

        if (results.rowCount === 1) {
            res.status(201).send();
        }
    }
});

// TODO: Testar
app.put("/police", async (req, res) => {
    let { id, nome, password, posto } = req.body;

    let queryInsertPolicia = {
        text: "UPDATE utilizador SET nome=$2, password=$3, posto=$4 WHERE id=$1",
        values: [id, nome, password, posto]
    }

    let results = await dbClient.query(queryInsertPolicia);

    if (results.rowCount === 1) {
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

app.get("/police", async (req, res) => {
    let querySelectPolicias = {
        text: "SELECT * FROM policia",
    }

    let results = await dbClient.query(querySelectPolicias);

    res.status(200).send(results.rows);
});

// Por testar...
app.delete("/police/:id", async (req, res) => {
    let queryInsertPolicia = {
        text: "UPDATE policia SET removido=1 WHERE id=$1",
        values: [req.params.id]
    }

    let results = await dbClient.query(queryInsertPolicia);
    if (results.rowCount === 1) {
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

app.get("/police/policeStation/:stationId", async (req, res) => {
    let queryVerificarPostoPolicia = {
        text: "SELECT * FROM policia WHERE posto=$1",
        values: [req.params.stationId]
    }

    let results = await dbClient.query(queryVerificarPostoPolicia);

    res.status(200).send(results.rowCount === 0);
});

// Por testar...
app.delete("/police/policeStation/:stationId", async (req, res) => {
    let queryRemoverPolicasDoPosto = {
        text: "UPDATE policia SET removido=1 WHERE posto=$1",
        values: [req.params.stationId]
    }

    let results = await dbClient.query(queryRemoverPolicasDoPosto);

    res.status(200).send();
});

app.put("/user/:userNif/reactivate", async (req, res) => {
    try {
        const nif = req.params.userNif;
        const queryAtivarUser = queries.queryActivateUser(nif);
        const row = await dbClient.query(queryAtivarUser);

        if (row.rowCount === 0) {
            res.status(404).send();
            return;
        }

        res.status(200).send();

    } catch (error) {
        res.status(500).send();
        console.log("Erro no /activate " + error);
    }
});

app.get("/checkMailDuplicate/:userMail", async (req, res) => {
    try {
        const queryMailDuplicado = {
            name: "fetch-emails",
            text: "SELECT * FROM utilizador WHERE email = $1",
            values: [req.params.userMail]
        };

        let results = await dbClient.query(queryMailDuplicado);

        let existeDuplicado = false;
        results.rowCount === 0
            ? existeDuplicado = true
            : existeDuplicado = false;

        if (existeDuplicado) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (error) {
        res.status(500).send();
        console.log("Erro no /checkMailDuplicado " + error);
    }

});

app.put("/user/:userNif/changePassword", async (req, res) => {
    try {
        let nif = req.params.userNif;
        let novaPass = req.body.novaPass;
        let passAtual = req.body.passAtual;

        let queryUser = queries.queryGetUserByNif(nif);

        // Verificar se as passes são iguais aqui.
        // Se sim -> atualizar.
        const row = await dbClient.query(queryUser);
        if (row.rowCount === 0) {
            res.status(404).send();
            return;
        }

        const user = row.rows[0];
        let comparacao = await bcrypt.compare(passAtual, user.password);
        if (!comparacao) {
            res.status(400).send();
            return;
        }

        if (await bcrypt.compare(novaPass, user.password)) {
            res.status(406).send();
            return;
        }

        let novaPassHashed = await passHash(novaPass);
        let queryAtualizacao = queries.queryUpdatePass(novaPassHashed, nif);
        const update_row = await dbClient.query(queryAtualizacao);
        if (update_row.rowCount === 0) {
            res.status(500).send();
            return;
        }

        res.status(200).send();

    } catch (error) {
        res.status(500).send();
        console.log(error);
        return;
    }
});

app.get("/user/:userNif", async (req, res) => {
    try {
        queryUser = {
            text: "SELECT * FROM utilizador WHERE nif=$1",
            values: [req.params.userNif]
        }

        let resultado = await dbClient.query(queryUser);
        let existeUser = resultado.rowCount === 1 ? true : false;

        if (existeUser) {
            let user = resultado.rows[0];

            let dados = {
                nome: user.nome,
                mail: user.email,
                telemovel: user.telemovel,
                morada: user.morada,
                nif: user.nif,
                nic: user.nic,
                tipo_conta: user.tipo_conta
            }

            res.status(200).send(dados);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send();
        console.log(error)
    }
});

app.post("/policeStation", async (req, res) => {
    const { codp, morada, localidade, telefone } = req.body;

    const querySelectPostos = {
        name: "create-station",
        text: "SELECT * FROM posto"
    };

    let resultsNumeroPostos = await dbClient.query(querySelectPostos);
    let id = resultsNumeroPostos.rowCount + 1;

    const queryCriarPosto = {
        text: "INSERT INTO posto(id, codpostal, morada, localidade, telefone, removido) VALUES ($1, $2, $3, $4, $5, $6)",
        values: [id, codp, morada, localidade, telefone, 0]
    };

    let results = await dbClient.query(queryCriarPosto);
    if (results.rowCount === 1) {
        res.send(201);
    } else {
        res.send(409);
    }
});

// TODO: por fazer...
app.put("/policeStation", async (req, res) => {
    const { codp, morada, localidade, telefone } = req.body;

    const querySelectPostos = {
        name: "update-station",
        text: ""
    };

    let resultsNumeroPostos = await dbClient.query(querySelectPostos);
    let id = resultsNumeroPostos.rowCount + 1;

    const queryCriarPosto = {
        text: "INSERT INTO posto(id, codpostal, morada, localidade, telefone, removido) VALUES ($1, $2, $3, $4, $5, $6)",
        values: [id, codp, morada, localidade, telefone, 0]
    };

    let results = await dbClient.query(queryCriarPosto);
    if (results.rowCount === 1) {
        res.send(201);
    } else {
        res.send(409);
    }
});

// TODO: Por testar
app.delete("/policeStation/:id", async (req, res) => {
    try {
        const queryApagarPostos = {
            name: "remove-station",
            text: "UPDATE posto SET removido=1 WHERE id=$1",
            values: [req.params.id]
        };

        let resultado = await dbClient.query(queryApagarPostos);
        let postoApagado = resultado.rowCount;

        if (postoApagado === 1) {
            res.status(200).send();
        }

    } catch (error) {
        if (error.code === '23503') {
            res.status(403).send();
        }
    }
});

app.get("/policeStation", async (req, res) => {

    const querySelectPostos = {
        text: "SELECT * FROM posto",
    };

    let resultado = await dbClient.query(querySelectPostos);
    let postos = resultado.rows;

    res.status(200).send(postos);
});

app.get("/policeStation/:id", async (req, res) => {
    const querySelectPostos = {
        text: "SELECT * FROM posto WHERE id=$1",
        values: [req.params.id]
    };

    let resultado = await dbClient.query(querySelectPostos);
    let posto = resultado.rows;

    res.status(200).send(posto);
});

app.post("/object", async (req, res) => {
    try {
        let { titulo, nifUser, desc, imagens, dataRegisto, categoria } = req.body;

        imagens == [] ? imagens = null : imagens;

        let imagensEmString = "";
        imagens.forEach( (imagem) => { imagensEmString += imagem.data_url + "?" } );

        let queryObterIdNovoObjeto = {
            text: "SELECT * FROM objeto",
        }
        let id = (await dbClient.query(queryObterIdNovoObjeto)).rowCount + 1;

        let queryCriarObjeto = {
            text: "INSERT INTO objeto(id,nifUser,descricao,titulo,imagens, dataRegisto, categoria) VALUES($1,$2,$3,$4,$5,$6,$7)",
            values: [id,nifUser,desc,titulo,imagensEmString, dataRegisto, categoria]
        }
        let result = await dbClient.query(queryCriarObjeto);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send({id: id});
        }
    } catch (error) {
        console.log(error);
    }
});

app.post("/object/setField", async (req, res) => {
    try {
        let { idObj, campo, valor } = req.body;

        let queryInserirValorCampo = {
            text: "INSERT INTO atributoobjeto(idObj, campo, valor) VALUES($1,$2,$3)",
            values: [idObj, campo, valor]
        }
        let result = await dbClient.query(queryInserirValorCampo);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send();
        }
    } catch (error) {
        console.log(error);
    } 
});

app.put("/object/setField", async (req, res) => {
    try {
        let { idObj, campo, valor } = req.body;

        let queryLimparAtributos = {
            text: "DELETE FROM atributoobjeto WHERE idobj=$1",
            values: [idObj]
        }
        await dbClient.query(queryLimparAtributos);

        let queryInserirValorCampo = {
            text: "INSERT INTO atributoobjeto(idObj, campo, valor) VALUES($1,$2,$3)",
            values: [idObj, campo, valor]
        }
        let result = await dbClient.query(queryInserirValorCampo);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }
    } catch (error) {
        res.status(500).send();
        console.log(error);
    } 
});

app.put("/object", async (req, res) => {
    try {
        let { idObj, titulo, desc, imagens, categoria } = req.body;

        imagens == [] ? imagens = null : imagens;

        let imagensEmString = "";
        imagens.forEach( (imagem) => { imagensEmString += imagem.data_url + "?" } );

        let queryAtualizarObjeto = {
            text: "UPDATE objeto SET descricao=$3, titulo=$2, imagens=$4, categoria=$5 WHERE id=$1",
            values: [idObj, titulo, desc, imagensEmString, categoria]
        }
        let result = await dbClient.query(queryAtualizarObjeto);
        if ( result.rowCount === 1 ) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/object/user/:userNif", async (req, res) => {
    try {
        let queryObterObjetosUser = {
            text: "SELECT * FROM objeto WHERE nifUser=$1",
            values: [req.params.userNif]
        }
        let result = await dbClient.query(queryObterObjetosUser);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({objetos: result.rows});
        }
    } catch (error) {
        console.log(error);

    }
});

app.get("/object/:object_id", async (req, res) => {
    try {
        let queryObterObjeto = {
            text: "SELECT * FROM objeto WHERE id=$1",
            values: [req.params.object_id]
        }
        let result = await dbClient.query(queryObterObjeto);
        let objeto = result.rows[0];

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({obj: objeto});
        }
    } catch (error) {
        console.log(error);

    }
});

app.get( "/object/atributes/:object_id", async (req, res) => {
    try {

        let queryObterAtributos = {
            text: "SELECT * FROM atributoobjeto WHERE idobj=$1",
            values: [req.params.object_id]
        }
        let result = await dbClient.query(queryObterAtributos);
        let atributos = result.rows;
        console.log(atributos);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send(atributos);
        }
    } catch (error) {
        console.log(error);

    }
});

// Não usar...
app.delete("/object/:object_id", async (req, res) => {
    try {
        let queryApagarObjeto = {
            text: "UPDATE objeto SET removido=1 WHERE id=$1",
            values: [req.params.object_id]
        }
        
        let resultado = await dbClient.query(queryApagarObjeto);
        let objetoApagado = resultado.rowCount;

        if (objetoApagado === 1) {
            res.status(200).send();
        }
    } catch (error) {
        console.log(error);
    }
});

app.post("/categoryName", async (req, res) => {
    try {
        let { nomeCat } = req.body;

        let queryCriarNomeCategoria = {
            text: "INSERT INTO nomecategoria(nome) VALUES($1)",
            values: [nomeCat]
        }

        let criarNomeCat = await dbClient.query(queryCriarNomeCategoria);
        if (criarNomeCat.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send();
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /category: " + error);
    }
});

app.post("/category", async (req, res) => {
    try {
        let { cat, campo } = req.body;

        let queryAssociarCampoACategoria = {
            text: "INSERT INTO categoria(cat, campo) VALUES($1, $2)",
            values: [cat, campo]
        }

        let criarNomeCat = await dbClient.query(queryAssociarCampoACategoria);
        if (criarNomeCat.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /category: " + error);
    }
});

app.get("/category", async (req, res) => {
    try {

        let queryObterCategorias = {
            text: "SELECT * FROM categoria"
        }

        let results = await dbClient.query(queryObterCategorias);
        if (results.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({ categorias: results.rows });
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /category: " + error);
    }
});

app.get("/categoryFields/:categoryName", async (req, res) => {
    try {

        let queryObterCategorias = {
            text: "SELECT campo FROM categoria WHERE cat=$1",
            values: [req.params.categoryName]
        }

        let results = await dbClient.query(queryObterCategorias);
        if (results.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send(results.rows);
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /category: " + error);
    }
});

app.post("/field", async (req, res) => {
    try {
        let { nomeCampo, tipoValor, valores } = req.body;

        valores = null;

        let queryCriarCampo = {
            text: "INSERT INTO campo(nome, tipo_valor, valores) VALUES($1, $2, $3)",
            values: [nomeCampo, tipoValor, valores]
        }

        let criarNomeCat = await dbClient.query(queryCriarCampo);
        if (criarNomeCat.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send();
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /field: " + error);
    }
});

app.get("/field/:fieldName", async (req, res) => {
    try {
        let queryObterInfoCampo = {
            text: "SELECT * FROM campo WHERE nome=$1",
            values: [req.params.fieldName]
        }

        let results = await dbClient.query(queryObterInfoCampo);
        if (results.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send( results.rows );
        }

    } catch (error) {
        res.status(500).send();
        console.log("Erro no POST /field: " + error);
    }
});

app.get("/location/:location_id", async (req, res) => {
    try {
        
        let queryObterLocalidade = {
            text: "SELECT * FROM localizacao WHERE id=$1",
            values: [req.params.location_id]
        }
        let result = await dbClient.query(queryObterLocalidade);
        let loc = result.rows[0];

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({loc: loc});
        }
    } catch (error) {
        console.log(error);

    }
});

app.post("/location", async (req, res) => {
    try {
        let {pais,dist,munc,freg,rua,morada,codp} = req.body;

        dist === "" ? dist = null : dist;
        munc === "" ? munc = null : munc;
        freg === "" ? freg = null : freg;
        rua === "" ? rua = null : rua;
        morada === "" ? morada = null : morada;
        codp === "" ? codp = null : codp;

        let queryObterIdLocalizacao = {
            text: "SELECT * FROM localizacao",
        }
        let id = (await dbClient.query(queryObterIdLocalizacao)).rowCount + 1;

        let queryCriarLocalizacao = {
            text: "INSERT INTO localizacao(id,pais,dist,munc,freg,rua,morada,codp,coords) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            values: [id, pais, dist, munc, freg, rua, morada, codp, null]
        }
        let result = await dbClient.query(queryCriarLocalizacao);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send({id: id});
        }
    } catch (error) {
        console.log(error);
    }
});

app.put("/location", async (req, res) => {
    try {
        let {id, pais, dist, munc, freg, rua, morada, codp, coords} = req.body;

        let queryAtualizarLocalizacao = {
            text: "UPDATE localizacao SET pais=$1, dist=$2, munc=$3, freg=$4, rua=$5, morada=$6, codp=$7, coords=$8 WHERE id=$9",
            values: [pais, dist, munc, freg, rua, morada, codp, coords, id]
        }
        let result = await dbClient.query(queryAtualizarLocalizacao);
        if ( result.rowCount === 1 ) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/lostObject/user/:userNif", async (req, res) => {
    try {
        let queryObterObjetoPerdidoPorId = {
            text: "SELECT * FROM objeto WHERE nifuser=$1 AND id IN (SELECT id FROM perdido)",
            values: [req.params.userNif]
        }
        let result = await dbClient.query(queryObterObjetoPerdidoPorId);
        let objetos = result.rows;

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({objPerdidos: objetos});
        }
    } catch (error) {
        console.log(error);

    }
});

app.get("/lostObject/:object_id", async (req, res) => {
    try {
        let queryObterObjetoPerdido = {
            text: "SELECT * FROM perdido WHERE id=$1",
            values: [req.params.object_id]
        }
        let result = await dbClient.query(queryObterObjetoPerdido);
        let objeto = result.rows[0];

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({objPerdido: objeto});
        }
    } catch (error) {
        console.log(error);

    }
});

// TODO: Por testar
app.post("/lostObject", async (req, res) => {
    try {
        let {idObj,idLoc,lostDate,lostTime,lostDateInfLim,lostDateSupLim } = req.body;
        if (lostTime === "" && lostDate === "") {
            lostTime = null;
            lostDate = null;
        }

        if (lostDateInfLim === "" && lostDateSupLim === "") {
            lostDateInfLim = null;
            lostDateSupLim = null;
        }

        let queryObterIdNovoObjetoPerdido = {
            text: "SELECT * FROM perdido",
        }
        let idPerdido = (await dbClient.query(queryObterIdNovoObjetoPerdido)).rowCount + 1;

        let queryCriarObjeto = {
            text: "INSERT INTO perdido(id,idPerdido,objetoAchado,perdido_em,lostDate,lostTime,lostDateInfLim,lostDateSupLim,removido) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            values: [idObj,idPerdido, null, idLoc, lostDate,lostTime,lostDateInfLim,lostDateSupLim,0]
        }
        let result = await dbClient.query(queryCriarObjeto);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send({id: idPerdido});
        }

    } catch (error) {
        console.log(error);
    }
});

app.put("/lostObject", async (req, res) => {
    try {
        let { idObj, lostDate, lostTime, lostDateInfLim, lostDateSupLim } = req.body;

        let queryAtualizarObjetoPerdido = {
            text: "UPDATE perdido SET lostdate=$2, losttime=$3, lostdateinflim=$4, lostdatesuplim=$5 WHERE idperdido=$1",
            values: [idObj, lostDate, lostTime, lostDateInfLim, lostDateSupLim]
        }
        let result = await dbClient.query(queryAtualizarObjetoPerdido);
        if ( result.rowCount === 1 ) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (error) {
        console.log(error);
    }
});

// TODO: Por testar...
app.delete("/lostObject/:lostObject_id", async (req, res) => {
    try {
        let queryApagarObjetoPerdido  = {
            text: "UPDATE perdido SET removido=1 WHERE idperdido=$1",
            values: [req.params.lostObject_id]
        }

        let results = await dbClient.query(queryApagarObjetoPerdido);
        if (results.rowCount === 1) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }

    } catch (error) {
        console.log(error);
    }
});

app.post("/foundObject", async (req, res) => {
    try {
        let {idObj,idLoc,policia,foundDate,foundTime,foundDateInfLim,foundDateSupLim } = req.body;
        if (foundTime === "" && foundDate === "") {
            foundTime = null;
            foundDate = null;
        }

        if (foundDateInfLim === "" && foundDateSupLim === "") {
            foundDateInfLim = null;
            foundDateSupLim = null;
        }

        if ( policia === "" ) {
            policia = null;
        }

        let queryObterIdNovoObjetoAchado = {
            text: "SELECT * FROM achado",
        }
        let idAchado = (await dbClient.query(queryObterIdNovoObjetoAchado)).rowCount + 1;

        let dataLeilao = new Date();
        dataLeilao.setDate((dataLeilao.getDate() + 7));

        let dataCompleta =  dataLeilao.getDate() + "/" + (dataLeilao.getMonth() + 1) + "/" + dataLeilao.getFullYear();

        let queryCriarObjetoAchado = {
            text: "INSERT INTO achado(id,idachado,data_leilao,achado_em,policia,founddate,foundtime,foundDateInfLim,foundDateSupLim, removido ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
            values: [idObj, idAchado, dataCompleta, idLoc, policia, foundDate, foundTime, foundDateInfLim, foundDateSupLim, 0]
        }
        let result = await dbClient.query(queryCriarObjetoAchado);

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send({id: idAchado});
        }

    } catch (error) {
        console.log(error);
    }
});

app.get("/foundObject/:object_id", async (req, res) => {
    try {
        let queryObterObjetoAchado = {
            text: "SELECT * FROM achado WHERE id=$1",
            values: [req.params.object_id]
        }
        let result = await dbClient.query(queryObterObjetoAchado);
        let objeto = result.rows[0];

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({objAchado: objeto});
        }
    } catch (error) {
        console.log(error);

    }
});

app.get("/foundObject/user/:userNif", async (req, res) => {
    try {
        let queryObterObjetoAchadoPorId = {
            text: "SELECT * FROM objeto WHERE nifuser=$1 AND id IN (SELECT id FROM achado)",
            values: [req.params.userNif]
        }
        let result = await dbClient.query(queryObterObjetoAchadoPorId);
        let objetos = result.rows;

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({objAchados: objetos});
        }
    } catch (error) {
        console.log(error);

    }
});

app.put("/foundObject", async (req, res) => {
    try {
        let { idObj, foundDate, foundTime, foundDateInfLim, foundDateSupLim } = req.body;

        let queryAtualizarObjetoAchado = {
            text: "UPDATE achado SET founddate=$2, foundtime=$3, founddateinflim=$4, founddatesuplim=$5 WHERE idachado=$1",
            values: [idObj, foundDate, foundTime, foundDateInfLim, foundDateSupLim]
        }
        let result = await dbClient.query(queryAtualizarObjetoAchado);
        if ( result.rowCount === 1 ) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (error) {
        console.log(error);
    }
});

// TODO: Por testar...
app.delete("/foundObject/:foundObject_id", async (req, res) => {
    try {
        let queryApagarObjetoAchado  = {
            text: "UPDATE achado SET removido=1 WHERE idachado=$1",
            values: [req.params.foundObject_id]
        }

        let results = await dbClient.query(queryApagarObjetoAchado);
        if (results.rowCount === 1) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }

    } catch (error) {
        console.log(error);
    }
});

// TODO: ...
app.put("/foundObject/:id_foundObject/owner/:nif", async (req, res) => {

});

// TODO: Implementar.
app.get("/object/compare/:id_foundObject/:id_lostObject", async (req, res) => {

});

/** TODO: auction **/
// Validações
app.post("/auction", async (req, res) => {

    let { data_inicio, data_fim, valor, id_achado } = req.body;

    try{

        let id = obterId("leilao");
        let queryCriarLeilao = {
            text: "INSERT INTO leilao(id, data_inicio, data_fim, valor, id_achado, removido, aberto) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            values: [id, data_inicio, data_fim, valor, id_achado, 0, 0]
        }
        let result = await dbClient.query(queryCriarLeilao);
        // Falta a validação aqui...

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(201).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.get("/auction/:auction_id", async (req, res) => {
    try{

        let queryObterLeilao= {
            text: "SELECT * FROM leilao WHERE id=$1",
            values: [req.params.auction_id]
        }
        let result = await dbClient.query(queryObterLeilao);

        // Falta a validação para verificar se o id é um int...

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({ leilao: result.rows });
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.put("/auction", async (req, res) => {
    try{
        let { id, titulo, data_inicio, data_fim, valor } = req.body;

        let queryAtualizarLeilao={
            text: "UPDATE leilao SET titulo=$2, data_inicio=$3, data_fim=$4, valor=$5 WHERE id=$1",
            values: [id, titulo, data_inicio, data_fim, valor]
        }
        let result = await dbClient.query(queryAtualizarLeilao);

        // Faltam as validações...

        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.delete("/auction/:auction_id", async (req, res) => {
    try{

        let queryRemoverLeilao={
            text: "UPDATE leilao SET removido=1 WHERE id=$1",
            values: [req.params.auction_id]
        }
        let result = await dbClient.query(queryRemoverLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.get("/auction/getAllByDate/:initialDate/:finalDate", async (req, res) => {
    try{

        let queryObterLeiloesPorData={
            text: "SELECT * FROM leilao WHERE initialDate>=$1 AND finalDate<=$2",
            values: [req.params.initialDate, req.params.finalDate]
        }
        let result = await dbClient.query(queryObterLeiloesPorData);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send({leiloes: result.rows});
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.post("/auction/:auction_id/subscribe/:nif", async (req, res) => {
    try{

        let queryVerificarInscricao = {
            text: "SELECT * FROM subscrever WHERE nif=$1",
            values: [req.params.nif]
        }

        let userExiste = await dbClient.query(queryVerificarInscricao);

        if ( userExiste.rowCount > 0 ) {
            res.status(403).send();
        } else {
            let queryInscreverUserEmLeilao={
                text: "INSERT INTO subscrever(nif, id_leilao, removido) VALUES ($1, $2, $3)",
                values: [req.params.auction_id, req.params.nif, 0]
            }
            let result = await dbClient.query(queryInscreverUserEmLeilao);

            // Faltam as validações...
            if (result.rowCount === 0) {
                res.status(404).send();
            } else {
                res.status(200).send();
        }
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.put("/auction/:auction_id/unsubscribe/:nic", async (req, res) => {
    try{

        let queryDesinscreverUserEmLeilao={
            text: "UPDATE subscrever SET removido=$2 WHERE nif=$1",
            values: [req.params.auction_id, req.params.nif]
        }
        let result = await dbClient.query(queryDesinscreverUserEmLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// TODO...
app.get("/auction/:auction_id/notify", async (req, res) => {

});

app.put("/auction/:auction_id/begin", async (req, res) => {
    try{

        let queryAbrirLeilao={
            text: "UPDATE subscrever SET aberto=1 WHERE id=$1",
            values: [req.params.auction_id]
        }
        let result = await dbClient.query(queryAbrirLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.put("/auction/:auction_id/end", async (req, res) => {
    try{

        let queryFecharLeilao={
            text: "UPDATE subscrever SET aberto=0 WHERE id=$1",
            values: [req.params.auction_id]
        }
        let result = await dbClient.query(queryFecharLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.get("/auction/:auction_id/history", async (req, res) => {
    try{

        let queryObterLicitacoesDeUmLeilao={
            text: "SELECT * from licita WHERE id_leilao=$1",
            values: [req.params.auction_id]
        }
        let result = await dbClient.query(queryObterLicitacoesDeUmLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

app.post("/makeOffer", async (req, res) => {
    try{
        let {nif, id_leilao, valor} = req.body;

        let queryObterIdLicitacao = {
            text: "SELECT * FROM licita WHERE nif=$1 AND id_leilao=$2",
            values:[nif, id_leilao]
        }
        let id = (await dbClient.query(queryObterIdLicitacao)).rowCount + 1;

        let queryObterLicitacoesDeUmLeilao={
            text: "INSERT INTO licita(nif, id_leilao, valor, data, id) VALUES($1,$2,$3,$4,$5)",
            values: [nif, id_leilao, valor, new Date().getTime, id]
        }
        let result = await dbClient.query(queryObterLicitacoesDeUmLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// Devolve todas as licitações em que participou.
app.get("/user/:nif/subscribedAuctions", async (req, res) => {
    try{

        let queryObterLeiloesInscritos={
            text: "SELECT * FROM subscrever WHERE nif=$1",
            values: [req.params.nif]
        }
        let result = await dbClient.query(queryObterLeiloesInscritos);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// Devolve apenas os leilões em que participou, ou seja nos quais licitou.
app.get("/user/:nif/subscribedAuctions", async (req, res) => {
    try{

        let queryObterLeiloesParticipou={
            text: "SELECT DISTINCT id_leilao FROM licita WHERE nif=$1",
            values: [req.params.nif]
        }
        let result = await dbClient.query(queryObterLeiloesParticipou);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// Pagar objeto no fim do leilão
app.post("/user/:nif/payAuction/:auction_id", async (req, res) => {
    try{

        let queryPagarLeilao={
            text: "",
            values: [req.params.nif, req.params.auction_id]
        }
        let result = await dbClient.query(queryPagarLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// TODO: ...
app.post("/auction/registerWinner", async (req, res) => {
    try{

        let queryRegistarVencedorLeilao={
            text: "",
            values: []
        }
        let result = await dbClient.query(queryRegistarVencedorLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});

// TODO: ...
app.get("/user/:nif/auctionsWon", async (req, res) => {
    try{

        let queryPagarLeilao={
            text: "",
            values: [req.params.nif, req.params.auction_id]
        }
        let result = await dbClient.query(queryPagarLeilao);

        // Faltam as validações...
        if (result.rowCount === 0) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }

    } catch (error) {
        console.log("Erro no /auction: " + error);
        res.status(500).send();
    }
});
/** TODO: auction **/

app.listen(3001, (err) => {
    if (err) console.log(err);
    console.log("Servidor a correr.");
});