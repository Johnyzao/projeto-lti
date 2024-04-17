const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')
const validator = require('validator');
const jwt = require('jsonwebtoken');

const dbClient = require('./connect_db');
const queries = require('./utils/queries');
const locationDB = require('./persistent/locationDB');
const categoryDB = require('./persistent/categoryDB');
const objectDB = require('./persistent/objectDB');
const lostObjectDB = require('./persistent/lostObjectDB');

const {HttpException} = require('./utils/HttpException');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()) ;
app.use(cookieParser());
app.use(cors());


//Função para encriptar a password do utilizador
async function passHash(password){
    try{
        // [Salting] 
        // -técnica de segurança que adiciona uma string aleatória (salt) 
        //  à senha antes de aplicar o algoritmo de hash. 
        // [Salt rounds] 
        // - número de interações do algoritmo de hashing
        // - quantas mais salt rounds ->  + segurança && - performance
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }catch(error){
        console.error("Erro ao gerar hash: " + error);
    }
}

//Função para validar os dados de registo
function validateData(data){
    console.log( data );
    
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
    try{
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
        if(Object.values(validacaoDados).some(value => value === false)){
            //console.log(validacaoDados);
            //const errosDetetados = Object.keys(validacaoDados).filter(key => !validacaoDados[key]);
            //res.status(400).send();
        }

        //Limpeza de caracteres
        Object.keys(parametros).forEach((key) => {
            if(typeof parametros[key] === "string"){
                parametros[key] = validator.escape(validator.trim(parametros[key]));
            } 
        });
        //Hash da password
        parametros.pass = await passHash(parametros.pass);
        console.log(parametros)

        // #######################################
        // #### 2. Inserção na base de dados. ####
        // #######################################
        const {nif, nic, nome, gen, dnasc, telemovel, mail, pass, morada} = parametros
        //Query parametrizada que regista um utilizador
        const queryRegisto = {
            name: 'register-user',
            text: 'INSERT INTO utilizador(nif, nic, nome, genero, ano_nascimento, telemovel, email, password, morada, tipo_conta, estado) \
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            values: [parseInt(nif),nic,nome,gen,dnasc,telemovel,mail,pass, morada, "u", "a"]
        } 
            
        const results = dbClient.query(queryRegisto);
        //Se não encontrar resultados
        if((await results).rowCount === 0){
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
        const {mail, pass} = req.body;
        console.log( req.body );
        console.log( "Info de login recebida: Email - " + mail + " Pass - " + pass);

        const queryLogin = {
            name: "login",
            text: "SELECT * FROM utilizador WHERE email = $1",
            values: [ mail ]
        };

        let results = await dbClient.query(queryLogin);
        let existeUtilizador = results.rowCount === 1 ? true : false;
        let passwordCorreta = await bcrypt.compare(pass, results.rows[0].password);
        let autenticar = existeUtilizador && passwordCorreta;

        if ( autenticar ) {
            res.status(200).send({ 
                nif: results.rows[0].nif, 
                nome: results.rows[0].nome, 
                mail:results.rows[0].email,
                estado: results.rows[0].estado
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


app.put("/user", async (req, res) => {
    try{
        let resultado = await dbClient.query(queries.queryUpdateUser(req.body));
        let userAtualizado = resultado.rowCount === 1 ? true : false;
        
        if (userAtualizado) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }

    } catch(error) {
        res.status(500).send();
        console.log("Erro no PUT /user " + error);
    }
});

app.delete("/user/:userNif", async (req, res) => {
    try{

        const nif = req.params.userNif;
        const queryApagarUser = queries.queryDeleteUser(nif);
        const row = await dbClient.query(queryApagarUser);

        if(row.rowCount == 0){
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
    try{
        const nif = req.params.userNif;

        const queryDesativarUser = queries.queryDeactivateUser(nif);
        const row = await dbClient.query(queryDesativarUser);

        if(row.rowCount == 0){
            res.status(404).send();
            return;
        }

        res.status(200).send();
        
    } catch (error) {
        res.status(500).send();  
        console.log("Erro no /deactivate " + error); 
    }
});

// TODO: Testar
// TODO: parse e validação dos dados
// TODO: Reposta nif invalido
app.put("/user/:userNif/activate", async (req, res) => {
    try{
        const nif = req.params.userNif;
        const queryAtivarUser = queries.queryActivateUser(nif);
        const row = await dbClient.query(queryAtivarUser);
        
        if(row.rowCount === 0){
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
            values: [ req.params.userMail ]
        };

        let results = await dbClient.query(queryMailDuplicado);
        
        let existeDuplicado = false;
        results.rowCount === 0 
            ? existeDuplicado = true 
            : existeDuplicado = false;

        if ( existeDuplicado ) {
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
    try{
        let nif = req.params.userNif;
        let novaPass = req.body.novaPass;
        let passAtual = req.body.passAtual;
    
        let queryUser = queries.queryGetUserByNif(nif);
    
        // Verificar se as passes são iguais aqui.
        // Se sim -> atualizar.
        const row = await dbClient.query(queryUser);
        if(row.rowCount === 0){
            res.status(404).send();
            return;
        }

        const user = row.rows[0];
        let comparacao = await bcrypt.compare(passAtual, user.password);
        if(!comparacao){
            res.status(400).send();
            return;
        }

        if ( await bcrypt.compare(novaPass, user.password)  ) {
            res.status(406).send();
            return;
        }

        let novaPassHashed = await passHash(novaPass);
        let queryAtualizacao = queries.queryUpdatePass(novaPassHashed, nif);
        const update_row = await dbClient.query(queryAtualizacao);
        if(update_row.rowCount === 0){
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
    try{
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
    
            res.status(200).send( dados );
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send();
        console.log(error)
    }
});

app.post("/policeStation", async (req, res) => {
    const {codp, morada} = req.body;

    const querySelectPostos = {
        text: "SELECT * FROM posto",
    };

    let resultsNumeroPostos = await dbClient.query(querySelectPostos);
    let id = resultsNumeroPostos.rowCount + 1;

    const queryCriarPosto = {
        text: "INSERT INTO posto(id, codpostal, morada) VALUES ($1, $2, $3)",
        values: [id, codp, morada]
    };

    let results = await dbClient.query( queryCriarPosto );
    if ( results.rowCount === 1 ) {
        res.send(201);
    } else {
        res.send(409);
    }
});

app.get("/allPoliceStations", async (req, res) => {
    const querySelectPostos = {
        text: "SELECT * FROM posto",
    };

    let resultado = await dbClient.query(querySelectPostos);
    let postos = resultado.rows;

    console.log( postos );
    res.status(200).send( postos );
});

app.get("/object", async (req,res) => {
    try{
        const result = await objectDB.select_all();
        res.status(200).send(result);
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.post("/object", async (req, res) => {
    try{
        const params = {...req.body}
        //const {id, descricao, nome} = params;
        //Validação e sanitização
  
        /*
        const validate_object = {
            validate_id :  validator.isEmpty (id.toString()) ? false : validator.isInt(id.toString()) ,
            validate_descricao : validator.isEmpty (descricao) ? false : true,
            validate_nome : validator.isEmpty (nome) ? false : true
        }

        console.log(validate_object);

        if(Object.values(validate_object).some(value => value === false)){
            throw new HttpException(400, "");
        }

        Object.keys(params).forEach((key) => {
            if(typeof params[key] === "string"){
                params[key] = validator.escape(validator.trim(params[key]));
            } 
        });
        */
        const result = await objectDB.insert(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send(result);
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.put("/object", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await objectDB.update(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.delete("/object", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await objectDB.delete_object(params.id);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.post("/category", async (req, res) => {
    try{
        const params = {...req.body}
        const result = await categoryDB.insert(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.put("/category", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await categoryDB.update(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.delete("/category", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await categoryDB.delete_category(params.nome);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.get("/location", async (req, res) => {
    try{
        const result = await locationDB.all();
        res.status(200).send(result);
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});
app.post("/location", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await locationDB.insert(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send(result);
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.put("/location", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await locationDB.update(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.delete("/location", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await locationDB.delete_location(params.id);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.get("/lostObject", async (req, res) => {
    try{
        const result = await lostObjectDB.all();
        res.status(200).send(result);

    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.post("/lostObject", async (req, res) => {
    try{
        const params = {...req.body}
       
        const result = await lostObjectDB.insert(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send(result);
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.put("/lostObject", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await lostObjectDB.update(params);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.delete("/lostObject", async (req, res) => {
    try{
        const params = {...req.body}

        const result = await lostObjectDB.delete_object(params.id);

        if(result.rowCount === 0){
            throw new HttpException(404, "");
        }

        res.status(200).send();
    } catch(error){
        console.log(error);
        if(error instanceof HttpException){
            res.status(error.status_code).send();
        } else {
            res.status(500).send();
        }
    }
});

app.listen(3000, (err) => {
    if ( err ) console.log(err);
    console.log("Servidor a correr.");
});