import React, { useState, useEffect } from 'react';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

import PopupAlterarPass from '../Popups/PopupAlterarPass';
import PopupApagarConta from '../Popups/PopupApagarConta';
import PopupDesativarConta from '../Popups/PopupDesativarConta';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PasswordStrengthBar from 'react-password-strength-bar';


function EditarUser() {
    let nif = JSON.parse( localStorage.getItem( "dados" ) ).nif;

    let templateDados = {
        nome: "",
        mail: "",
        telemovel: "",
        genero: "",
        morada: "",
        nif: 0,
        nic: 0,
        dnasc: "01/01/2000"
    };
    
    const [modoEdicao, setModoEdicao] = useState(false);
    const [dadosAtuais, setDadosAtuais] = useState(templateDados);
    const [mailDuplicado, setMailDuplicado] = useState(false);
    const [erroInterno, setErroInterno] = useState(false);

    function verificarMailDuplicado(novoMail) {
        axios.get(
            config.LINK_API + "/checkMailDuplicate/" + novoMail,
            { headers: {'Content-Type': 'application/json'}},
            { validateStatus: function (status) {
              return true;
            }}
        ).then( (res) => {
          res.status === 200 
            ? setMailDuplicado(false)
            : setMailDuplicado(true);
      }).catch(function (error) {
        if ( error.response ) {
            let codigo = error.response.status;
    
            codigo === 401
              ? setMailDuplicado(true) 
              : setMailDuplicado(false); 
    
            codigo === 500 
              ? setErroInterno(true) 
              : setErroInterno(false); 
        }
        })
      }

    const validate = values => {
        const errors = {};

        /** Verificacoes do Nome **/
        validator.isAlpha( values.nome ) && values.nome !== "" 
            ? delete errors.nome  
            :  errors.nome = "Nome inválido.";
        
        /** Verificacoes do Mail **/
        validator.isEmail( values.mail ) && values.mail !== ""  
            ? delete errors.mail
            : errors.mail = "Email inválido.";
        
        verificarMailDuplicado(values.mail);
        values.mail === dadosAtuais.mail && mailDuplicado
            ? errors.mail = "Email já existe, por favor insira outro."
            : delete errors.mail;

        /** Verificacoes do NIC **/
        ( (validator.isNumeric(values.nic) && (values.nic.length === 8) ) || values.nic === "") 
            ? delete errors.nic 
            : errors.nic = "NIC inválido.";

        /** Verificacoes do Telemovel **/
        validator.isMobilePhone( values.telemovel ) || values.telemovel === "" 
            ? delete errors.telemovel
            : errors.telemovel = "Número de telemóvel inválido.";

        !erroInterno 
            ? delete errors.erroInterno
            : errors.erroInterno = "Erro interno, por favor tente de novo.";

        console.table(errors);
        return errors;
    }

    async function obterInfoUtilizador(nif) {
        await axios.get(
            config.LINK_API + "/user/" + nif,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            console.log(res);
            setDadosAtuais( res.data );
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
                codigo === 500 
                  ? setErroInterno(true) 
                  : setErroInterno(false); 
            }
        });
    }

    async function atualizarUtilizador(novaInfoUser) {
    
        await axios.put(
           config.LINK_API + "/user" , 
            novaInfoUser ,
            { headers: {'Content-Type': 'application/json'}}
        ).then( (res) => {
            // Strings de debug
            console.log("Dados recebidos do pedido PUT /user:" + res.data );
    
            if ( res.status === 200 ) {
                setModoEdicao(false);
                // Redirect
                // Maybe popup a dizer que foram alterados os dados.
            } 
    
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
                
                codigo === 500 
                  ? setErroInterno(true) 
                  : setErroInterno(false); 
            }
        })
    };

    // Colorcar o nif no user aqui.
    useEffect( () => { obterInfoUtilizador(nif) }, [] );
    const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
        nome: dadosAtuais.nome,
        mail: dadosAtuais.mail,
        nic: dadosAtuais.nic, 
        telemovel: dadosAtuais.telemovel, 
        morada: dadosAtuais.morada
    },
    //validateOnChange:false,
    //validateOnBlur:false,
    validate,
    onSubmit: values => {
        atualizarUtilizador( values );
    },
    });

    return (
        <div className='container-sm bg-light'>
            <h1> Informações pessoais </h1>
                <h4> Editar informações pessoais </h4>
            <Form onSubmit={formik.handleSubmit}>
                <Row>
                <Col>
                { /** Nome **/ }
                <Form.Label htmlFor="nome">Nome: </Form.Label>
                <Form.Control
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
                </Col>

                <Col>
                { /** Mail **/ }
                <Form.Label htmlFor="mail">Mail:</Form.Label>
                <Form.Control
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
                </Col>
                </Row>

                { /** NIC **/ }
                <Row>
                <Col>
                <Form.Label htmlFor="nic">NIC:</Form.Label>
                <Form.Control
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
                </Col>

                { /** Número de telemóvel **/ }
                <Col>
                <Form.Label htmlFor="nic">Número de telemóvel:</Form.Label>
                <Form.Control
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
                </Col>

                { /** Morada **/ }
                <Col>
                <Form.Label htmlFor="nic">Morada:</Form.Label>
                <Form.Control
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
                </Col>
                </Row>

                { modoEdicao ? (
                    <Container className='text-center'>
                    <Button className='text-center' type="submit" onClick={formik.handleSubmit}> Submeter Alterações </Button>
                    <br/>
                    <br/>
                    </Container>
                ) : null }
            </Form>
        
        <Container className='text-center'>
        { !modoEdicao ? (
            <Button className='btn btn-primary' onClick={ () => {setModoEdicao(true)} }> Editar Informações </Button>
        ) : (
            <div>
                <Button onClick={ () => {
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
                }}> Reset </Button>
                <span> &ensp; </span>
                <Button onClick={ () => {
                    setModoEdicao(false);
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
                }}> Cancelar </Button>
            </div>
        )}
        </Container>

        <br/>
        <br/>
        <br/>

        <div>
            <h4> Alterar a sua password </h4>
            <PopupAlterarPass nif={dadosAtuais.nif}/>
        </div>

        <br/>
        <br/>
        <br/>

        <div>
            <h4> Gestão de conta </h4>
            <p> Desativar a sua conta significa que pode voltar a ativá-la a qualquer momento. </p>
            <PopupDesativarConta nif={dadosAtuais.nif}/>
            {' '}
            <PopupApagarConta nif={dadosAtuais.nif}/>
        </div>
        </div>
    )
}

export default EditarUser;
