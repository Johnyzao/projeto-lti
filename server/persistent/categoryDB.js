const { HttpException } = require("../utils/HttpException");
const dbClient = require("../connect_db");

//INSERT
const insert = async (category) =>{
    try{
        const {nome, valor, tipo} = category;

        const insert_category = {
            name: 'insert-category',
            text: 'INSERT INTO Categoria (nome, valor, atributo) \
                        VALUES ($1,$2, $3)',
            values: [nome,valor,tipo]
        }
        const row = await dbClient.query(insert_category);
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
const select = async (name) =>{
    try{
        const select_category = {
            name: 'select-category',
            text: 'SELECT * FROM Categoria WHERE nome = $1',
            values: [name]
        }
        const row = await dbClient.query(select_category);
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
const update = async (category) =>{
    try{
        const {nome, valor, tipo} = category;

        const update_category = {
            name: 'update-category',
            text: 'UPDATE Categoria SET valor = $1, tipo = $2 WHERE nome = $3',
            values: [valor,tipo,nome]
        }
        const row = await dbClient.query(update_category);
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
const delete_category = async (nome) =>{
    try{
        const delete_category = {
            name: 'delete-category',
            text: 'DELETE FROM Categoria WHERE nome = $1',
            values: [nome]
        }
        const row = await dbClient.query(delete_category);
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
    select,
    update,
    delete_category
}