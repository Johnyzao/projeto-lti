const express = require('express');
const app = express();

// TODO:
//  - Inicializar a session.
app.get("/", (req, res) => {
    res.send("Teste");
});

// TODO:
//  - Iniciar a session.
app.get("/register", (req, res) => {

});

// TODO:
//  - Obter os dados do user do Form.
//  - Limpar caracteres especiais e encriptar a password.
//  - Criar as Queries para colocar a info na BD.
//  - Interface da página.
app.post("/register", (req, res) => {

});

app.listen(3000, () => {console.log("Teste")});