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
const queries = require('./utils/queries')

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
            res.status(400).send();
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

// TODO: Completar o código.
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
        let passwordCorreta = existeUtilizador && bcrypt.compare(pass, results.rows[0].password) 
            ? true 
            : false;

        if ( passwordCorreta ) {
            const token = jwt.sign(
            { nif: results.rows[0].nif, nome: results.rows[0].nome }, 
            "daf3d765ddbcc17ab43f4ad71c6e83cdb339080ce157a943650982ef095d5dc8"
            );
            res.status(200).send({token: token});
        } else {
            res.status(401).send(); 
        }


    } catch (error) {
        res.status(500).send();
        console.log("Erro no /login " + error);
        return;
    }
});

// TODO: Completar e testar.
app.put("/user", (req, res) => {
    try{
        if (true) {
            res.status(200).send();
        } 
    } catch(error) {
        res.status(500).send();
        console.log("Erro no PUT /user " + error);
    }
});


// TODO: Completar e testar.
app.get("user/:userNif/verifyPassword", (req, res) => {

});

// TODO: Completar e testar.
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

// TODO: Completar e testar.
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
        console.log( results.rowCount );
        
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

// TODO: Testar
// TODO: Validação e parse dos dados
app.put("/user/:userNif/changePassword", async (req, res) => {
    try{
        let nif = req.params.userNif;
        let {pass} = req;
        let novaPass = req.body.novaPass;
    
        let queryUser = queries.queryGetUserByNif(nif);
        
        let queryAtualizacao = queries.queryUpdatePass(novaPass, nif);
    
        // Verificar se as passes são iguais aqui.
        // Se sim -> atualizar.
        const row = await dbClient.query(queryUser);

        if(row.rowCount === 0){
            res.status(404).send();
            return;
        }

        const user = row[0];

        if(!bcrypt.compare(pass, user.password)){
            res.status(400).send();
            return;
        }

        const update_row = await dbClient.query(queryAtualizacao);

        if(update_row.rowCount === 0){
            res.status(404).send();
            return;
        }

        res.status(200).send();
    } catch (error) {
        res.status(500).send();
        console.log("Erro interno do servidor");
        return;
    }
});

app.get("/user", (req, res) => {
    try{
        queryUser = {
            text: "SELECT * FROM user WHERE nif=$1",
            values: [req.body.nif]
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