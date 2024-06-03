"use strict";
const { HttpExpcetion } = require("../utils/HttpException");
const dbClient = require("./connect_db");

const insert = async (user) => {
    try{
        const {nif,nic,nome,gen,dnasc,telemovel,mail,pass} = user;

        const insert_user = {
            name: 'register-user',
            text: 'INSERT INTO Utilizador(nif, nic, nome, genero, dnasc, telemovel, email, password) \
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            values: [nif,nic,nome,gen,dnasc,telemovel,mail,pass]
            };
        const row = await dbClient.query(insert_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

const select_user_by_mail = async (mail) => {
    try{
        const select_user = {
            name: 'select-user-mail',
            text: "SELECT * FROM Utilizador WHERE email=$1",
            values: [mail]
            };
        const row = await dbClient.query(select_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

//A pass ja é obtida com queryLoginMail
let queryLoginPass = (pass) => {
    return {
        text: "SELECT * FROM user WHERE pass=$1",
        values: [pass]
    }
    
}

const select_user_by_nif = async (nif) => {
    try{
        const select_user = {
            name: "get-user",
            text: "SELECT * FROM Utilizador WHERE nif = $1",
            values: [nif]
        };
        const row = await dbClient.query(select_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

let update_user = async (user) => {
    try{
        const {nic, nome, gen, telemovel, mail, morada} = user;

        const update_user = {
            name: "update-user",
            text: "UPDATE Utilizador SET " + 
                  "nome = $1, gen = $2, telemovel = $3, mail = $4, morada = $5 " + 
                  "WHERE nic = $6",
            values: [nome, gen, telemovel, mail, morada, nic]
        }
        const row = await dbClient.query(update_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

let delete_user = async (nif) => {
    try{
        const delete_user = {
            name: "delete-user",
            text: "DELETE FROM user WHERE nif=$1",
            values: [nif]
        }

        const row = await dbClient.query(delete_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

let deactivate_user = async  (nif) => {
    try{
        const deactivate_user = {
            name: "deactivate-user",
            text: "UPDATE user SET estado= 'd' WHERE nif=$1",
            values: [nif]
        }
        const row = await dbClient.query(deactivate_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

let activate_user = async (nif) => {
    try{
        const activate_user = {
            name: "activate-user",
            text: "UPDATE user SET estado= 'a' WHERE nif=$1",
            values: [nif]
        }
        const row = await dbClient.query(activate_user);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}

let update_user_pass = async (newPass, nif) => {
    try{
        let update_pass = {
            name: "update-user-password",
            text: "UPDATE user SET pass=$1 WHERE nif=$2",
            values:[newPass, nif]
        }
        const row = await dbClient.query(update_pass);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpExpcetion(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpExpcetion(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpExpcetion(400, "");
            default: //Outros tipos de erros
                throw new HttpExpcetion(500, "");
        }               
    }
}
module.exports = { 
    insert,
    queryLoginPass, 
    select_user_by_mail, 
    select_user_by_nif,
    update_user,
    delete_user,
    deactivate_user,
    activate_user,
    update_user_pass
}


