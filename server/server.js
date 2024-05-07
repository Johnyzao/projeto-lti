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
    console.log(data);

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

app.post("/login", async (req, res) => {
    try {
        const { mail, pass } = req.body;
        console.log(req.body);
        console.log("Info de login recebida: Email - " + mail + " Pass - " + pass);

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
        console.log(pass);

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

        console.log( { nome, telemovel, mail, dnasc, genero } );

        const queryProcurarUsers = {
            text: "SELECT * FROM utilizador WHERE nome LIKE $1 AND telemovel LIKE $2 AND email LIKE $3 AND genero LIKE $4",
            values: [nome, telemovel,mail,genero]
        }
        let result = await dbClient.query(queryProcurarUsers);

        console.log(result.rowCount);
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
    console.log(req.body);

    let querySelectPolicia = {
        text: "SELECT * FROM policia WHERE id=$1",
        values: [id]
    }

    let resultsDuplicado = await dbClient.query(querySelectPolicia);
    if (resultsDuplicado.rowCount === 1) {
        res.status(401).send();
    } else {
        let queryInsertPolicia = {
            text: "INSERT INTO policia(id, nome, password, posto) VALUES($1, $2, $3, $4)",
            values: [id, nome, pass, posto]
        }

        let results = await dbClient.query(queryInsertPolicia);

        if (results.rowCount === 1) {
            res.status(201).send();
        }
    }
});

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

app.delete("/police/:id", async (req, res) => {
    let queryInsertPolicia = {
        text: "DELETE FROM policia WHERE id=$1",
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

app.delete("/police/policeStation/:stationId", async (req, res) => {
    let queryRemoverPolicasDoPosto = {
        text: "DELETE FROM policia WHERE posto=$1",
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

        console.log("atualizado.");
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
        text: "SELECT * FROM posto",
    };

    let resultsNumeroPostos = await dbClient.query(querySelectPostos);
    let id = resultsNumeroPostos.rowCount + 1;

    const queryCriarPosto = {
        text: "INSERT INTO posto(id, codpostal, morada, localidade, telefone) VALUES ($1, $2, $3, $4, $5)",
        values: [id, codp, morada, localidade, telefone]
    };

    let results = await dbClient.query(queryCriarPosto);
    if (results.rowCount === 1) {
        res.send(201);
    } else {
        res.send(409);
    }
});

app.delete("/policeStation/:id", async (req, res) => {
    try {
        const queryApagarPostos = {
            name: "delete-station",
            text: "DELETE FROM posto WHERE id=$1",
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

    console.log(postos);
    res.status(200).send(postos);
});

app.get("/policeStation/:id", async (req, res) => {
    const querySelectPostos = {
        text: "SELECT * FROM posto WHERE id=$1",
        values: [req.params.id]
    };

    let resultado = await dbClient.query(querySelectPostos);
    let posto = resultado.rows;

    console.log(posto);
    res.status(200).send(posto);
});

// TODO: Implementar.
app.get("/object/compare/:id_foundObject/:id_lostObject", async (req, res) => {

});

app.post("/object", async (req, res) => {
    try {
        let { titulo, nifUser, desc, imagens, dataRegisto } = req.body;

        imagens == [] ? imagens = null : imagens;

        let imagensEmString = "";
        imagens.forEach( (imagem) => { imagensEmString += imagem.data_url + "?" } );

        let queryObterIdNovoObjeto = {
            text: "SELECT * FROM objeto",
        }
        let id = (await dbClient.query(queryObterIdNovoObjeto)).rowCount + 1;

        let queryCriarObjeto = {
            text: "INSERT INTO objeto(id,nifUser,descricao,titulo,imagens, dataRegisto) VALUES($1,$2,$3,$4,$5,$6)",
            values: [id,nifUser,desc,titulo,imagensEmString, dataRegisto]
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

app.put("/object", async (req, res) => {
    try {
        let { idObj, titulo, desc, imagens } = req.body;

        imagens == [] ? imagens = null : imagens;

        let imagensEmString = "";
        imagens.forEach( (imagem) => { imagensEmString += imagem.data_url + "?" } );

        let queryAtualizarObjeto = {
            text: "UPDATE objeto SET descricao=$3, titulo=$2, imagens=$4 WHERE id=$1",
            values: [idObj, titulo, desc, imagensEmString]
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
        console.log(req.params.object_id);
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

app.delete("/object/:object_id", async (req, res) => {
    try {
        let queryApagarObjeto = {
            text: "DELETE FROM objetos WHERE id=$1",
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

app.post("/category", async (req, res) => {
    try {
        const params = { ...req.body }
        const result = await categoryDB.insert(params);

        if (result.rowCount === 0) {
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch (error) {
        console.log(error);
        if (error instanceof HttpException) {
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.put("/category", async (req, res) => {
    try {
        const params = { ...req.body }

        const result = await categoryDB.update(params);

        if (result.rowCount === 0) {
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch (error) {
        console.log(error);
        if (error instanceof HttpException) {
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.delete("/category", async (req, res) => {
    try {
        const params = { ...req.body }

        const result = await categoryDB.delete_category(params.nome);

        if (result.rowCount === 0) {
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch (error) {
        console.log(error);
        if (error instanceof HttpException) {
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.get("/location/:location_id", async (req, res) => {
    try {
        
        let queryObterLocalidade = {
            text: "SELECT * FROM localidade WHERE id=$1",
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
            text: "SELECT * FROM localidade",
        }
        let id = (await dbClient.query(queryObterIdLocalizacao)).rowCount + 1;

        console.log(id);
        let queryCriarLocalizacao = {
            text: "INSERT INTO localidade(id,pais,dist,munc,freg,rua,morada,codp,coords) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
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
            text: "UPDATE localidade SET pais=$1, dist=$2, munc=$3, freg=$4, rua=$5, morada=$6, codp=$7, coords=$8 WHERE id=$9",
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

app.delete("/location", async (req, res) => {
    try {
        const params = { ...req.body }

        const result = await locationDB.delete_location(params.id);

        if (result.rowCount === 0) {
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch (error) {
        console.log(error);
        if (error instanceof HttpException) {
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
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
        console.log(objetos);

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

app.post("/lostObject", async (req, res) => {
    try {
        let {idObj,idLoc,lostDate,lostTime,lostDateInfLim,lostDateSupLim } = req.body;
        console.log(req.body);
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
            text: "INSERT INTO perdido(id,idPerdido,objetoAchado,perdido_em,lostDate,lostTime,lostDateInfLim,lostDateSupLim ) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
            values: [idObj,idPerdido, null, idLoc, lostDate,lostTime,lostDateInfLim,lostDateSupLim]
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

app.delete("/lostObject/:lostObject_id", async (req, res) => {
    try {
        let queryApagarObjetoPerdido  = {
            text: "DELETE FROM perdido WHERE idperdido=$1",
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

/** TODO: lostObject **/
// Falta a correspondence, getAllFoundObjects
/** TODO: lostObject **/

/** TODO: foundObject **/
app.post("/foundObject", async (req, res) => {

});

app.get("/foundObject", async (req, res) => {

});

app.put("/foundObject", async (req, res) => {

});

app.delete("/foundObject", async (req, res) => {

});

app.put("/foundObject/:id_foundObject/owner/:nif", async (req, res) => {

});
/** TODO: foundObject **/

/** TODO: auction **/
app.post("/auction", async (req, res) => {

});

app.get("/auction/:auction_id", async (req, res) => {

});

app.put("/auction", async (req, res) => {

});

app.delete("/auction", async (req, res) => {

});

app.get("/auction/getAllByDate/:initialDate/:finalDate", async (req, res) => {

});

app.put("/auction/:auction_id/subscribe/:nic", async (req, res) => {

});

app.put("/auction/:auction_id/unsubscribe/:nic", async (req, res) => {

});

app.get("/auction/:auction_id/notify", async (req, res) => {

});

app.put("/auction/:auction_id/begin", async (req, res) => {

});

app.put("/auction/:auction_id/end", async (req, res) => {

});

app.get("/auction/:auction_id/history", async (req, res) => {

});

app.post("/auction/:auction_id/user/:nif/makeOffer/:value", async (req, res) => {

});
/** TODO: auction **/

app.listen(3001, (err) => {
    if (err) console.log(err);
    console.log("Servidor a correr.");
});