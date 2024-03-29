import React, { useState, useEffect } from 'react';
import Link from 'react';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

function EditarUser() {
    const [modoEdicao, setModoEdicao] = useState(false);
    const [dadosAtuais, setDadosAtuais] = useState({});
    const [mailDuplicado, setMailDuplicado] = useState(false);

    function verificarMailDuplicado(novoMail) {
        axios.get(
            "http://localhost:3000/checkMailDuplicate",
            {mail: novoMail},
            { headers: {'Content-Type': 'application/json'}}
        ).then( (res) => {
            res.status === 200 
                ? setMailDuplicado(false)
                : setMailDuplicado(true);
        });
    }

    const validate = values => {
        const errors = {};

        /** Verificacoes do Nome **/
        validator.isAlpha( values.nome ) && values.nome !== "" 
            ? errors.nome = ""  
            :  errors.nome = "Nome inválido.";
        
        /** Verificacoes do Mail **/
        validator.isEmail( values.mail ) && values.mail !== ""  
            ? errors.mail = ""
            : errors.mail = "Email inválido.";
        
        verificarMailDuplicado(values.mail);
        mailDuplicado
            ? errors.mail = "Email já existe, por favor insira outro."
            : errors.mail = "";

        /** Verificacoes do NIC **/
        ( (validator.isNumeric(values.nic) && (values.nic.length === 8) ) || values.nic === "") 
            ? errors.nic = ""
            : errors.nic = "NIC inválido.";

        /** Verificacoes do Telemovel **/
        validator.isMobilePhone( values.telemovel ) || values.telemovel === "" 
            ? errors.telemovel = ""
            : errors.telemovel = "Número de telemóvel inválido.";

        return errors;
    }

    function obterInfoUtilizador() {
        axios.get(
            "http://localhost:3000/getSession",
            { headers: {'Content-Type': 'application/json'}},
            { validateStatus: function (status) {
                return true;
            }}
        ).then( ( res ) => {
            setDadosAtuais( res.data );
        });
    }

    // TODO
    async function atualizarUtilizador(novaInfoUser) {
    
        await axios.put(
           "http://localhost:3000/user" , 
            novaInfoUser ,
            { validateStatus: function (status) {
              return true;
            }},
            { headers: {'Content-Type': 'application/json'}}
        ).then( (res) => {
            // Strings de debug
            console.log("Dados recebidos do pedido PUT /edit:" + res.data );
            console.log(res.statusText);
    
            if ( res.status === 500 ) {
                // TODO
            } 
    
            if ( res.status === 401 ) {
                // TODO
            }
    
            if ( res.status === 200 ) {
                // TODO
            } 
    
        });
    };

    useEffect( () => { obterInfoUtilizador() }, [] );
    const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
        nome: dadosAtuais.nome,
        mail: dadosAtuais.mail,
        nic: dadosAtuais.nic, 
        telemovel: dadosAtuais.telemovel, 
        gen: dadosAtuais.gen, 
        morada: dadosAtuais.morada
    },
    validate,
    onSubmit: values => {
        atualizarUtilizador( values );
    },
    });

    return (
        <>
            <h1> Informações pessoais </h1>
                <h4> Editar informações pessoais </h4>
            <form onSubmit={formik.handleSubmit}>
                { /** Nome **/ }
                <label htmlFor="nome">Nome: </label>
                <input
                    id="nome"
                    name="nome"
                    type="text"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nome}
                />

                {formik.touched.nome && formik.errors.nome ? (
                    <div>{formik.errors.nome}</div>
                ) : null}

                { /** NIF **/ }
                { /** Faria sentido deixar alterar o NIF?? */}
                <p>O seu NIF: {dadosAtuais.nif} </p>

                { /** Mail **/ }
                <label htmlFor="mail">Mail:</label>
                <input
                    id="mail"
                    name="mail"
                    type="mail"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.mail}
                />

                {formik.touched.mail && formik.errors.mail ? (
                    <div>{formik.errors.mail}</div>
                ) : null}
                <br/>

                { /** Mail **/ }
                <label htmlFor="dnasc">Data de Nascimento:</label>
                <input
                    id="dnasc"
                    name="dnasc"
                    type="date"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dnasc}
                />
                <br/>

                { /** NIC **/ }
                <label htmlFor="nic">NIC:</label>
                <input
                    id="nic"
                    name="nic"
                    type="text"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nic}
                />

                {formik.touched.nic && formik.errors.nic ? (
                    <div>{formik.errors.nic}</div>
                ) : null}
                <br/>

                { /** Número de telemóvel **/ }
                <label htmlFor="nic">Número de telemóvel:</label>
                <input
                    id="telemovel"
                    name="telemovel"
                    type="text"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.telemovel}
                />

                {formik.touched.telemovel && formik.errors.telemovel ? (
                    <div>{formik.errors.telemovel}</div>
                ) : null}
                <br/>

                { /** TODO: Género **/ }

                { /** Morada **/ }
                <label htmlFor="nic">Morada:</label>
                <input
                    id="morada"
                    name="morada"
                    type="text"
                    disabled={!modoEdicao}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.morada}
                />

                {formik.touched.morada && formik.errors.morada ? (
                    <div>{formik.errors.morada}</div>
                ) : null}
                <br/>

            { modoEdicao ? (
                <button type="submit"> Submeter Alterações </button>
            ) : null }
            </form>

        { !modoEdicao ? (
            <button onClick={ () => {setModoEdicao(true)} }> Editar Informações </button>
        ) : (
            <div>
                <button onClick={ () => {
                    formik.resetForm({
                        values: {
                            nome: dadosAtuais.nome,
                            mail: dadosAtuais.mail,
                            nic: dadosAtuais.nic, 
                            telemovel: dadosAtuais.telemovel, 
                            gen: dadosAtuais.gen, 
                            morada: dadosAtuais.morada 
                        }
                    })
                }}> Reset </button>
                <button onClick={ () => {setModoEdicao(false)} }> Cancelar </button>
            </div>
        )}

        <br/>
        <br/>
        <br/>
        <br/>

        <div>
            <h4> Alterar a sua password </h4>
            {/** TODO! */}
        </div>

        <div>
            <h4> Remoção de conta </h4>
            <p> Desativar a sua conta significa que pode voltar a ativá-la a qualquer momento. </p>

            { /** TODO: Adicionar espaço entre os dois botões! */ }
            <button onClick={ () => {} }> Desativar conta </button>
            <button onClick={ () => {} }> Apagar conta </button>
        </div>
        </>
    )
}

export default EditarUser;
