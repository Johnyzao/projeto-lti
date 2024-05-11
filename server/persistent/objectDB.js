const { HttpException } = require("../utils/HttpException");
const dbClient = require("../connect_db");


//INSERT
const insert = async (object) =>{
    try{
        const {id, descricao, nome,categoria} = object;

        const insert_object = {
            name: 'insert-object',
            text: 'INSERT INTO Objeto (id, descricao, nome, categoria) \
                        VALUES ($1,$2,$3, $4)',
            values: [id,descricao,nome,categoria]
        }

        const row = await dbClient.query(insert_object);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpException(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpException(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpException(400, "");
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}

//SELECT ALL
const select_all = async () =>{
    try{
        const select_all_objects = {
            name: 'select-all-object',
            text: 'SELECT * FROM Objeto',
        }
        const row = await dbClient.query(select_all_objects);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpException(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpException(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpException(400, "");
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}

//SELECT
const select = async (id) =>{
    try{
        const select_object = {
            name: 'select-object',
            text: 'SELECT * FROM Objeto WHERE id = $1',
            values: [id]
        }
        const row = await dbClient.query(select_object);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpException(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpException(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpException(400, "");
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}
//UPDATE
const update = async (object) =>{
    try{
        const {id, descricao, nome} = object;

        const update_object = {
            name: 'update-object',
            text: 'UPDATE Objeto SET descricao = $1, nome = $2 WHERE id = $3',
            values: [descricao,nome,id]
        }
        const row = await dbClient.query(update_object);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpException(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpException(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpException(400, "");
            case '42703':
                throw new HttpException(404, "");
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}
//DELETE
const delete_object = async (id) =>{
    try{
        const delete_object = {
            name: 'insert-object',
            text: 'DELETE FROM Objeto WHERE id = $1',
            values: [id]
        }
        const row = await dbClient.query(delete_object);
        return row;
    }catch(error){
        console.error(error);
        switch (error.code) {
            case '23505': //<UNIQUE> error
                throw new HttpException(409, "");
            case '23502': //<NOT NULL> error
                throw new HttpException(422, "");
            case '23503': //<FOREIGN KEY> error
                throw new HttpException(400, "");
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}

module.exports = {
    insert,
    select_all,
    select,
    update,
    delete_object
}