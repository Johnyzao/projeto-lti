const { HttpException } = require("../utils/HttpException");
const dbClient = require("../connect_db");

//INSERT
const insert = async (location) =>{
    try{
        const {id, coordenadas,pais,distrito,municipio,freguesia,rua} = location;
        console.log(location);
        const insert_location = {
            name: 'insert-location',
            text: 'INSERT INTO localidade (id, coordenadas, pais, distrito, municipio, freguesia, rua) \
                        VALUES ($1,$2, $3, $4, $5, $6, $7)',
            values: [id,coordenadas,pais,distrito,municipio,freguesia,rua]
        }
        const row = await dbClient.query(insert_location);
        return row;
    }catch(error){
        console.error(error.status_code);
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
//ALL
const all = async () =>{
    try{
        const select_all_locations = {
            name: 'select-all-locations',
            text: 'SELECT * FROM localidade',
        }
        const row = await dbClient.query(select_all_locations);
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
        const select_location = {
            name: 'select-location',
            text: 'SELECT * FROM location WHERE id = $1',
            values: [id]
        }
        const row = await dbClient.query(select_location);
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
const update = async (location) =>{
    try{
        const {id, coordenadas,pais,distrito,municipio,freguesia,rua} = location;

        const update_location = {
            name: 'update-location',
            text: 'UPDATE Localidade SET coordenadas = $1, pais = $2, distrito = $3, \
                        municipio = $4, freguesia = $5, rua = $6 WHERE id = $7',
            values: [coordenadas,pais,distrito,municipio,freguesia,rua,id]
        }
        const row = await dbClient.query(update_location);
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
const delete_location = async (id) =>{
    try{
        const delete_location = {
            name: 'delete-location',
            text: 'DELETE FROM Localidade WHERE id = $1',
            values: [id]
        }
        const row = await dbClient.query(delete_location);
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
    all,
    select,
    update,
    delete_location
}