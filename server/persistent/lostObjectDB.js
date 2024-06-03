const { HttpException } = require("../utils/HttpException");
const dbClient = require("../connect_db");

//ALL
const all = async() => {
    try{
        const all_foundObjects = {
            name: 'select-all-objects',
            text: 'SELECT * FROM encontrado',
        }
        const row = await dbClient.query(all_objects);
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

//INSERT
const insert = async (found_object) =>{
    try{
        const {id, local} = lost_object;
        
        const insert_object = {
            name: 'insert-found-object',
            text: 'INSERT INTO naoachado (id, perdido_em) \
                        VALUES ($1,$2)',
            values: [id,local]
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
//SELECT
const select = async (id) =>{
    try{
        const insert_object = {
            name: 'select-lost-object',
            text: 'SELECT * FROM NaoAchado WHERE id = $1',
            values: [id]
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

//UPDATE
const update = async (lost_object) =>{
    try{
        const {id, local} = lost_object;

        const update_object = {
            name: 'insert-lost-object',
            text: 'UPDATE NaoAchado SET perdido_em = $1 WHERE id=$2',
            values: [local,id]
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
            default: //Outros tipos de erros
                throw new HttpException(500, "");
        }               
    }
}
//DELETE
const delete_object = async (id) =>{
    try{
        const delete_object = {
            name: 'delete-lost-object',
            text: 'DELETE FROM NaoAchado WHERE id = $1',
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
    all,
    insert,
    select,
    update,
    delete_object
}