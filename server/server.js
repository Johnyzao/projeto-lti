const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')
const validator = require('validator');

const dbClient = require('./connect_db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()) ;
app.use(cookieParser());
app.use(cors())

// genuuid em falta? 
app.use(session({
    secret: "algo",
    resave: true,
    saveUninitialized: true
}));


app.get("/", (req, res) => {
    req.session.secret = req.sessionID;
});

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
    
    const validacaoDados = {
        nome: validator.isAlpha(data.nome),
        mail: validator.isEmail(data.mail), 
        telemovel: validator.isMobilePhone(data.telemovel.toString(), "pt-PT"), //Ex: +351911234567
        pass: validator.isStrongPassword(data.pass),
        nif: data.nif.toString().length == 9, //validator.isVat() so aceita entradas do tipo PT123456789
        nic: validator.isNumeric(data.nic.toString()) && data.nic.toString().length === 9,
        gen: data.gen === "m" || data.gen === "f" || data.gen === "o" || data.gen === "pnd",
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
            res.status(400).send();
            return;
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
        const {nif, nic, nome, gen, dnasc, telemovel, mail, pass} = parametros
        //Query parametrizada que regista um utilizador
        const queryRegisto = {
            name: 'register-user',
            text: 'INSERT INTO utilizador(nif, nic, nome, genero, dnasc, telemovel, email, password) \
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            values: [nif,nic,nome,gen,dnasc,telemovel,mail,pass]
            } 
            
        const results = dbClient.query(queryRegisto)
        
        //Se não encontrar resultados
        if(length(results) === 0){
            //statusMessage.faltaRecurso = true;
            res.status(404).send();
            return;
        }

        //statusMessage.userCriado = true;
        res.status(201).send();

    } catch (error) { //Se a query ou o servidor falharem
        console.error(error);
        switch (error.code){
            case '23505': //<UNIQUE> error
                //const constraintTypes = {
                //    utilizador_nif_pkey: "userDuplicado",
                //    unique_mail_constraint: "mailDuplicado",
                //    unique_nic_constraint: "nicDuplicado",
                //    unique_phone_constraint: "telemovelDuplicado"
                //}   
                //onst constraintType = constraintTypes[error.constraint];
                //statusMessage[constraintType] = true;
                res.status(409);
                break;

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
                //statusMessage[errorType] = true;
                res.status(422);
                break;

                default: //Outros tipos de erros
                    res.status(500);
                    //statusMessage.erroInterno = true;
                    break;
                }

        //Devolver a respetiva mensagem de erro para ser tratada no front-end
        res.send();
        return;                  
    }

});

// TODO: Completar o código.
app.post("/login", (req, res) => {
    try {
        const {mail, pass} = req.body;
        console.log( req.body );
        console.log( "Info de login recebida: Email - " + mail + " Pass - " + pass);

        if ( true ) {
            res.status(200).send();
            // Criar session aqui.
        } else {
            res.status(401).send(); 
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no /login " + error);
    }
});

// TODO: Completar e testar.
app.put("/user", (req, res) => {

});


// TODO: Completar e testar.
app.get("user/:userNif/verifyPassword", (req, res) => {

});

// TODO: Completar e testar.
app.delete("/user/:userNif", (req, res) => {
    try{
        const queryApagarrUser = {
            text: "DELETE FROM user WHERE nif=$1",
            values: [req.params.userNif]
        }

        if (true) {
            res.status(200).send();
            console.log(req.params.userNif);
        }

    } catch (error) {
        res.status(500).send();  
        console.log("Erro no DELETE /user " + error); 
    }
});

// TODO: Completar e testar.
app.put("/user/:userNif/deactivate", (req, res) => {
    try{
        const queryDesativarUser = {
            text: "UPDATE user SET estado= 'd' WHERE nif=$1",
            values: [req.params.userNif]
        }

        // TODO
        if (true) {
            res.status(200).send();
            console.log(req.params.userNif);
        }

    } catch (error) {
        res.status(500).send();  
        console.log("Erro no /deactivate " + error); 
    }
});

// TODO: Completar e testar.
app.put("/user/:userNif/activate", (req, res) => {
    try{
        const queryDesativarUser = {
            text: "UPDATE user SET estado= 'a' WHERE nif=$1",
            values: [req.params.userNif]
        }

        // TODO
        if (true) {
            res.status(200).send();
            console.log(req.params.userNif);
        }

    } catch (error) {
        res.status(500).send();  
        console.log("Erro no /activate " + error); 
    }
});

// TODO: Completar e testar.
app.get("/checkMailDuplicate", (req, res) => {
    try {
        const queryMailDuplicado = {
            text: "SELECT * FROM user WHERE mail=$1",
            values: [ req.body.novoMail ]
        };

        // Correr a query e associar ao if.
        if ( true ) {
            res.status(200).send();
        } else {
            res.status(409).send();
        }

    } catch (error) {
        res.status(500).send();  
        console.log("Erro no /checkMailDuplicado " + error); 
    }

});

// TODO
app.put("/user/:userNif/changePassword", (req, res) => {
    try{
        let nif = req.params.userNif;
        let novaPass = req.body.novaPass;
    
        let queryUser = {
            text: "SELECT * FROM user WHERE nif=$1",
            values: [nif]
        }
    
        let queryAtualizacao = {
            text: "UPDATE user SET pass=$1 WHERE nif=$2",
            values:[novaPass, nif]
        }
    
        // Verificar se as passes são iguais aqui.
        // Se sim -> atualizar.
        if (true) {
            res.status(200).send()
        } else {
            res.status(401).send();
        }
    } catch (error) {

    }
});

app.get("/user", (req, res) => {
    try{
        queryUser = {
            text: "SELECT * FROM user WHERE mail=$1",
            values: [req.body.mail]
        }
    
        if (true) {
            let dados = {
                nome: "Teste",
                mail: "teste@gmail.com",
                telemovel: "968181077",
                genero: "m",
                morada: "Rua lol",
                nif: "225881209",
                nic: "",
                dnasc: "01/01/2000"
            }
    
            res.status(200).send( dados );
        } 
    } catch (error) {
        res.status(500).send();
    }
});

app.listen(3000, (err) => {
    if ( err ) console.log(err);
    console.log("Servidor a correr.");
});