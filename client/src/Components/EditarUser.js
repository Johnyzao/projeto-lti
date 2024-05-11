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
    let mailAtual = JSON.parse( localStorage.getItem( "dados" ) ).mail;

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
    const [erroInternoEdicao, setErroInternoEdicao] = useState(false);
    const [dadosAlterados, setDadosAlterados] = useState(false);

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
              ? setErroInternoEdicao(true) 
              : setErroInternoEdicao(false); 

            
            setTimeout(() => {
                setErroInternoEdicao( false );
            }, 5000);
        }
        })
      }

    const validate = values => {
        const errors = {};

        /** Verificacoes do Nome **/
        values.nome !== "" 
            ? delete errors.nome  
            :  errors.nome = "Nome inválido.";
        
        /** Verificacoes do Mail **/
        validator.isEmail( values.mail ) && values.mail !== ""  
            ? delete errors.mail
            : errors.mail = "Email inválido.";
        
        verificarMailDuplicado(values.mail);
        mailDuplicado
            ? errors.mail = "Email já existe, por favor insira outro."
            : delete errors.mail;

        if (values.mail === mailAtual) {
            delete errors.mail;
        }
            
        /** Verificacoes do NIC **/
        ( (validator.isNumeric(values.nic) && (values.nic.length === 8) ) || values.nic === "") 
            ? delete errors.nic 
            : errors.nic = "NIC inválido.";

        /** Verificacoes do Telemovel **/
        validator.isMobilePhone( values.telemovel ) || values.telemovel === "" 
            ? delete errors.telemovel
            : errors.telemovel = "Número de telemóvel inválido.";

        !erroInternoEdicao 
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
            setDadosAtuais( res.data );
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
                codigo === 500 
                  ? setErroInternoEdicao(true) 
                  : setErroInternoEdicao(false); 

                setTimeout(() => {
                    setErroInternoEdicao( false );
                }, 5000);
            }
        });
    }

    async function atualizarUtilizador(novaInfoUser) {
    
        await axios.put(
           config.LINK_API + "/user" , 
            novaInfoUser ,
            { headers: {'Content-Type': 'application/json'}}
        ).then( (res) => {
    
            if ( res.status === 200 ) {
                setModoEdicao(false);
                setDadosAlterados(true);

                setTimeout(() => {
                    setDadosAlterados( false );
                }, 5000);

                obterInfoUtilizador(nif);
            } 
    
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
                
                codigo === 500 
                  ? setErroInternoEdicao(true) 
                  : setErroInternoEdicao(false); 

                setTimeout(() => {
                    setErroInternoEdicao( false );
                }, 5000);
            }
        })
    };

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
    validate,
    onSubmit: values => {
        let dadosNovos = {nome: values.nome, mail: values.mail, nic:values.nic, telemovel:values.telemovel, morada: values.morada, nif: nif};
        atualizarUtilizador( dadosNovos );
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
                    <div className='text-danger'>{formik.errors.nome}</div>
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
                    <div className='text-danger'>{formik.errors.mail}</div>
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
                    <div className='text-danger'>{formik.errors.nic}</div>
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
                    <div className='text-danger'>{formik.errors.telemovel}</div>
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
                    <div className='text-danger'>{formik.errors.morada}</div>
                ) : null}
                <br/>
                </Col>
                </Row>

                { erroInternoEdicao ? (<p className='text-danger text-center'> Erro interno, por favor tente outra vez. </p>) : null }
                { dadosAlterados ? (<p className='text-success text-center'> Dados alterados com sucesso. </p>) : null }
                <br/>
                <br/>
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
            <h4> Apagar conta </h4>
            {' '}
            <PopupApagarConta nif={dadosAtuais.nif}/>
        </div>
        </div>
    )
}

export default EditarUser;
