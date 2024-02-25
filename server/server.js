const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')

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

app.get("/getSession", (req, res) => {
    res.json( req.session.utilizador );
});

// TODO:
//  - Obter os dados do user do Form.
//  - Limpar caracteres especiais e encriptar a password.
//  - Criar as Queries para colocar a info na BD.
//  - Interface da página.
app.post("/register", (req, res) => {
    try{
        console.log( "JSON recebido: " );
        console.log( req.body );
        // Inserção na base de dados.
        // Se registar então
        if ( true ) {
            res.status(201).send({mailDuplicado: false, userCriado: true, erroInterno: false});
        } else {
            res.status(403).send({mailDuplicado: true, userCriado: false, erroInterno: false});
        }


    } catch (error) {
        res.status(500).send({mailDuplicado: false, userCriado: false, erroInterno: true});  
        console.log(error);      
    }

});

app.listen(3000, (err) => {
    if ( err ) console.log(err);
    console.log("Servidor a correr.");
});