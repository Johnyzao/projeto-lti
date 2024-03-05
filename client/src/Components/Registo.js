import React, { Component } from 'react'

// https://www.npmjs.com/package/validator
import validator from 'validator';

// https://www.npmjs.com/package/axios
import axios from 'axios';

// Possivelmente melhor: https://www.npmjs.com/package/react-hook-form

class Registo extends Component {

    constructor(props) {
      super(props)
    
      this.state = {
        nome: "",
        mail: "",
        telemovel: "",
        pass: "",
        nic: "",
        nif: "",
        gen: "m",
        dnasc: "",
        morada: "",

        erroNome: "",
        erroMail: "",
        erroTelemovel: "",
        erroPass: "",
        erroNic: "",
        erroNif: ""
      };
    }
    
    handlerNomeChange = (event) => {
        this.setState( { nome: event.target.value } );
        this.validateNome();
    }

    handlerMailChange = (event) => {
        this.setState( { mail: event.target.value } );
        this.validateMail();
    }

    handlerTelemovelChange = (event) => {
        this.setState( { telemovel: event.target.value } );
        this.validateTelemovel();
    }

    handlerPassChange = (event) => {
        this.setState( { pass: event.target.value } );
        this.validatePass();
    }

    handlerNicChange = (event) => {
        this.setState( { nic: event.target.value } );
        this.validateNic();
    }

    handlerNifChange = (event) => {
        this.setState( { nif: event.target.value } );
        this.validateNif();
    }

    handlerGenChange = (event) => {
        this.setState( { gen: event.target.value } );
    }

    handlerMoradaChange = (event) => {
        this.setState( { morada: event.target.value } );
    }

    handlerDataChange = (event) => {
        this.setState( { dnasc: event.target.value } );
        this.validateNasc();
    }

    validateNome = () => {
        validator.isAlpha( this.state.nome ) ? this.setState( {erroNome: ""} ) 
            : this.setState( {erroNome: "Nome contém caracteres inválidos."} );
    }

    validateMail = () => {
        validator.isEmail( this.state.mail ) ? this.setState( {erroMail: ""} )
            : this.setState( {erroMail: "Email inválido."});
    }

    validateTelemovel = () => {
        validator.isMobilePhone( this.state.telemovel ) || this.state.telemovel === "" ? this.setState( {erroTelemovel: ""} )
            : this.setState( {erroTelemovel: "Número de telemóvel inválido."} );
    }

    validatePass = () => {
        validator.isStrongPassword( this.state.pass ) ? this.setState( {erroPass: ""})
            : this.setState( {erroPass: "Palavra passe fraca, por favor altere-a."} );
    }

    // @TODO: Verificar esta implementação!
    validateNif = () => {
        validator.isVAT( this.state.nif, 'PT' ) || this.state.nif === "" ? this.setState( {erroNif: ""})
            : this.setState( {erroNif: "NIF inválido."} );
    }

    validateNic = () => {
        ( (validator.isNumeric(this.state.nic) && 
        (this.state.nic.length === 8) ) || 
        this.state.nic === "") ? this.setState( {erroNic: ""} )
            : this.setState( {erroNic: "NIC inválido."} );
    }

    // @TODO: Verificar como restringir a data.
    validateNasc = () => {

    }

    handleSubmit = (event) => {

        const { nome, mail, telemovel, pass, nif, nic, gen, morada, dnasc,
                erroMail, erroNic, erroNif, erroNome, erroPass, erroTelemovel  } = this.state;

        // Linha que permite ver o conteúdo no form.
        console.table( this.state );

        // Falta a validação.

        // redirect.

        if ( !([erroMail, erroNic, erroNif, erroNome, erroPass, erroTelemovel].some( (x) => x !== "" )) ) {
            
            let novoUtilizador = {
                "nome": validator.escape(validator.trim(nome)),
                "mail": validator.escape(validator.trim(mail)),
                "telemovel": validator.escape(telemovel),
                "pass": validator.escape(validator.trim(pass)),
                "nif": validator.escape(validator.trim(nif)),
                "nic": validator.escape(validator.trim(nic)),
                "gen": gen,
                "morada": validator.escape( validator.trim(morada) ),
                "dnasc": dnasc }

            async function registarUser() {
                return await axios.post("http://localhost:3001/register", novoUtilizador, { headers: {
                    'Content-Type': 'application/json'}});
            }
            
            let req = registarUser();
                req.then((res) => {
                    console.log( res.data );
            });

            // Remover no futuro...
            event.preventDefault();
        } else {
            event.preventDefault();
        }
    }

    render() {
        const { nome, mail, telemovel, pass, nif, nic, gen, morada, dnasc } = this.state;
        const { erroMail, erroNic, erroNif, erroNome, erroPass, erroTelemovel } = this.state;

        return (
            <div className='container-sm text-center d-flex justify-content-center bg-light'>
            <form className='' onSubmit={this.handleSubmit} >

                <div className="my-4">
                    <p>Informações que são obrigatórias estão assinaladas com um asterísco vermelho (<span className='text-danger'>*</span>).</p>
                    <label htmlFor="validationCustom01" className="form-label"> Nome de Utilizador:<span className='text-danger'>*</span> </label>
                    <input  type="text" 
                            id="validationCustom01"
                            name="nome" 
                            className="form-control"
                            value={nome}
                            onChange={this.handlerNomeChange}
                            required
                    />
                    <div id="ajudaNome" className="form-text">Utilize apenas letras no seu nome (a-z) e (A-Z).</div>
                    <div className="text-danger"> {erroNome} </div>
                </div>

                <div className="my-4" >
                    <label htmlFor="mail" className="form-label"> Email:<span className='text-danger'>*</span> </label>
                    <input  type="email" 
                            name="mail" 
                            className="form-control" 
                            value={mail}
                            onChange={this.handlerMailChange}
                            required
                    />
                    <div id="ajudaMail" className="form-text">Introduza um mail do tipo "exemplo@algo.com".</div>
                    <div className="text-danger"> {erroMail} </div>
                </div>

                <div className="my-4" >
                    <label htmlFor="pass" className="form-label"> Password:<span className='text-danger'>*</span> </label>
                    <input  type="password" 
                            name="pass" 
                            className="form-control"
                            value={pass}
                            onChange={this.handlerPassChange}
                    />
                    <div className="text-danger"> {erroPass} </div>
                </div>

                <div className="my-4">
                    <label htmlFor="genero" className="form-label"> Género:<span className='text-danger'>*</span> </label>
                    <select name="genero" className="form-control" value={gen} onChange={this.handlerGenChange} >
                        <option value="m">M</option>
                        <option value="f">F</option>
                        <option value="o">Outro</option>
                        <option value="pnd">Prefiro não dizer</option>
                    </select>
                </div>

                <div className="my-4">
                    <label htmlFor="dnasc" className="form-label"> Data de Nascimento:<span className='text-danger'>*</span> </label>
                    <input  type="date" 
                            name="dnasc" 
                            className="form-control"
                            value={dnasc}
                            onChange={this.handlerDataChange}
                    />
                </div>

                <div className="my-4" >
                    <p> As informaçõe seguintes </p>
                    <label htmlFor="telemovel" className="form-label"> Número de telemóvel: </label>
                    <input  type="text" 
                            name="telemovel" 
                            className="form-control"
                            value={telemovel}
                            onChange={this.handlerTelemovelChange}
                    />
                    <div className="text-danger"> {erroTelemovel} </div>
                </div>


                <div className="my-4">
                    <label htmlFor="nif" className="form-label"> NIF: </label>
                    <input  type="text" 
                            name="nif" 
                            className="form-control"
                            value={nif}
                            onChange={this.handlerNifChange}
                    />
                    <div className="text-danger"> {erroNif} </div>
                </div>
                <div className="my-4">
                    <label htmlFor="nic" className="form-label"> NIC: </label>
                    <input  type="text" 
                            name="nic" 
                            className="form-control"
                            value={nic}
                            onChange={this.handlerNicChange}
                    />
                    <div className="text-danger"> {erroNic} </div>
                </div>

                <div className="my-4">
                    <label htmlFor="morada" className="form-label"> Morada: </label>
                    <input  type="text" 
                            name="morada" 
                            className="form-control"
                            value={morada}
                            onChange={this.handlerMoradaChange}
                    />
                </div>

            <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
            </form>
            </div>
        );
    }
}

export default Registo;
