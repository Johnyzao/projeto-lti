"use strict";

let queryRegister = (args) => {
    const {nif,nic,nome,gen,dnasc,telemovel,mail,pass} = args;

    const queryRegisto = {
        name: 'register-user',
        text: 'INSERT INTO utilizador(nif, nic, nome, genero, dnasc, telemovel, email, password, removido) \
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        values: [nif,nic,nome,gen,dnasc,telemovel,mail,pass, 0]
        };
    
    return queryRegisto;
}

let queryGetUserByMail = (mail) => {
    return {
        text: "SELECT * FROM utilizador WHERE email=$1",
        values: [mail]
    };
}

//A pass ja é obtida com queryLoginMail
let queryLoginPass = (pass) => {
    return {
        text: "SELECT * FROM utilizador WHERE password=$1",
        values: [pass]
    }
}

let queryGetUserByNif = (nif) => {

    const queryGetUser = {
        name: "get-user",
        text: "SELECT * FROM utilizador WHERE nif = $1",
        values: [nif]
    };

    return queryGetUser;
}

let queryUpdateUser = (args) => {

    const {nif, nic, nome, telemovel, mail, morada} = args;

    const queryUpdateUser = {
        name: "update-user",
        text: "UPDATE utilizador SET " + 
              "nome = $1, telemovel = $2, email = $3, morada = $4, nic = $5 " + 
              "WHERE nif = $6",
        values: [nome, telemovel, mail, morada, nic ,nif]
    }

    return queryUpdateUser;
}

let queryDeleteUser = (nif) => {

    const queryApagarUser = {
        name: "delete-user",
        text: "UPDATE utilizador SET removido=1 WHERE nif=$1",
        values: [nif]
    }

    return queryApagarUser;
}

let queryDeactivateUser = (nif) => {
    const queryDesativarUser = {
        name: "deactivate-user",
        text: "UPDATE utilizador SET estado='d' WHERE nif=$1",
        values: [nif]
    }

    return queryDesativarUser;
}

let queryActivateUser = (nif) => {

    const queryAtivarUser = {
        name: "activate-user",
        text: "UPDATE utilizador SET estado='a' WHERE nif=$1",
        values: [nif]
    }

    return queryAtivarUser;
}

let queryUpdatePass = (newPass, nif) => {
    let queryAtualizacao = {
        name: "update-user-password",
        text: "UPDATE utilizador SET password=$1 WHERE nif=$2",
        values:[newPass, nif]
    }

    return queryAtualizacao;
}
module.exports = { 
    queryGetUserByMail, 
    queryLoginPass, 
    queryRegister, 
    queryGetUserByNif, 
    queryUpdateUser, 
    queryDeleteUser, 
    queryDeactivateUser, 
    queryActivateUser,
    queryUpdatePass
}


