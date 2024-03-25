"use strict";

let queryRegister = (args) => {
    const {nif,nic,nome,gen,dnasc,telemovel,mail,pass} = args;

    const queryRegisto = {
        name: 'register-user',
        text: 'INSERT INTO utilizador(nif, nic, nome, genero, dnasc, telemovel, email, password) \
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        values: [nif,nic,nome,gen,dnasc,telemovel,mail,pass]
        };
    
    return queryRegisto;
}

let queryGetUserByMail = (mail) => {
    return {
        text: "SELECT * FROM user WHERE email=$1",
        values: [mail]
    };
}

//A pass ja é obtida com queryLoginMail
let queryLoginPass = (pass) => {
    return {
        text: "SELECT * FROM user WHERE pass=$1",
        values: [pass]
    }
}

let queryGetUserByNif = (nif) => {

    const queryGetUser = {
        name: "get-user",
        text: "SELECT * FROM Utilizador WHERE nif = $1",
        values: [nif]
    };

    return queryGetUser;
}

let queryUpdateUser = (args) => {

    const {nic, nome, gen, telemovel, mail, morada} = args;

    const queryUpdateUser = {
        name: "update-user",
        text: "UPDATE Utilizador SET " + 
              "nome = $1, gen = $2, telemovel = $3, mail = $4, morada = $5 " + 
              "WHERE nic = $6",
        values: [nome, gen, telemovel, mail, morada, nic]
    }

    return queryUpdateUser;
}

let queryDeleteUser = (nif) => {

    const queryApagarUser = {
        name: "delete-user",
        text: "DELETE FROM user WHERE nif=$1",
        values: [nif]
    }

    return queryApagarUser;
}

let queryDeactivateUser = (nif) => {
    const queryDesativarUser = {
        name: "deactivate-user",
        text: "UPDATE user SET estado= 'd' WHERE nif=$1",
        values: [nif]
    }

    return queryDesativarUser;
}

let queryActivateUser = (nif) => {

    const queryAtivarUser = {
        name: "activate-user",
        text: "UPDATE user SET estado= 'a' WHERE nif=$1",
        values: [nif]
    }

    return queryAtivarUser;
}

let queryUpdatePass = (newPass, nif) => {
    let queryAtualizacao = {
        name: "update-user-password",
        text: "UPDATE user SET pass=$1 WHERE nif=$2",
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


