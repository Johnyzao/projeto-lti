class HttpException extends Error {

    constructor(status_code, message){
        super(message);
        this.name= "HttpError";
        this.status_code = status_code;
    }
}

module.exports = {
    HttpException
}