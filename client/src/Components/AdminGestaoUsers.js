import React, { useState} from 'react';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import { useFormik } from 'formik';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import validator from 'validator';

import PopupApagarContaAdmin from '../Popups/PopupApagarContaAdmin';
import PopupDesativarConta from '../Popups/PopupDesativarConta';
import PopupReativarConta from '../Popups/PopupReativarConta';

function AdminGestaoUsers() {

    const [generoProcura, setGeneroProcura] = useState("");
    const [usersAchados, setUsersAchados] = useState([]);

    function procurarUtilizadores(infosProcura) {
        axios.post(
            config.LINK_API + "/searchUsers",
            infosProcura,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            setUsersAchados(res.data.resultados);
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 404) {
                    setUsersAchados([]);
                }

                setTimeout(() => {

                }, 5000);
            }
        });
    }

    function desativarConta(userNif){

    }

    function reativarConta(userNif){

    }

    const validate = values => {
        const errors = {};

        validator.isMobilePhone( values.telemovel )
            ? delete errors.telemovel
            : errors.telemovel = "Número de telemóvel inválido.";

        validator.isEmail( values.mail )
            ? delete errors.mail
            : errors.mail = "Email inválido.";

        if ( values.telemovel === "" ) {
            delete errors.telemovel;
        }
        if ( values.mail === "" ) {
            delete errors.mail;
        }
        if ( values.dnasc === "" ) {
            delete errors.dnasc;
        }

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            nome:"",
            telemovel:"",
            mail:"",
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            let infosProcura = {
                nome: values.nome,
                telemovel: values.telemovel,
                mail: values.telemovel,
                genero: generoProcura
            }

            procurarUtilizadores(infosProcura);
        },
    });

    const construirTabela = usersAchados.map( user => {
        let estado = "";
        if ( user.estado === "a" ) {
            estado = "Conta ativa";
        }
        if (user.estado === "d") {
            estado = "Conta desativada";
        }
        return ( <tr key={user.nif}>
            <td> {user.nif} </td>
            <td> {user.nome} </td>
            <td> {user.telemovel === "" ? "Não associou" : user.telemovel} </td>
            <td> {user.email} </td>
            <td> {user.tipo_conta === "u" ? "Utilizador padrão" : "Administrador"} </td>
            <td> {estado} </td>
            <td> <PopupApagarContaAdmin user={user.tipo_conta} nif={user.nif}/> 
                &nbsp; &nbsp; 
                { user.estado === "a" 
                    ? (<PopupDesativarConta nif={user.nif} /> ) 
                    : (<PopupReativarConta nif={user.nif} /> ) 
                } 
            </td> 
        </tr> )
    });

    return (
        <>
            <Form onSubmit={formik.handleSubmit} >
                <h3 className='text-center'> Gestão de contas de utilizadores. </h3>
                <p> Nesta página é possível desativar, reativar e apagar as contas dos vários utilizadores da aplicação.</p>
            
                <p> Preencha os campos de forma a procurar por utilizadores, a procura devolve matches semelhantes e iguais.</p>
                <Form.Label htmlFor="nome">Nome: </Form.Label>
                    <Form.Control
                        id="nome"
                        name="nome"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nome}
                    />
                
                <Form.Label htmlFor="telemovel">Telemóvel: </Form.Label>
                    <Form.Control
                        id="telemovel"
                        name="telemovel"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.telemovel}
                    />
                {formik.errors.telemovel ? (
                    <div className='text-danger'>{formik.errors.telemovel}</div>
                ) : null}

                <Form.Label htmlFor="mail">Mail: </Form.Label>
                    <Form.Control
                        id="mail"
                        name="mail"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.mail}
                    />
                {formik.errors.mail ? (
                    <div className='text-danger'>{formik.errors.mail}</div>
                ) : null}
                
                <Form.Label>Género:</Form.Label>
                <Form.Select as="select"
                    size="lg"
                    id="genero"
                    name="genero"
                    onChange={(e) => {setGeneroProcura(e.target.value)}}
                >
                    <option values=""> </option>
                    <option values="Masculino">Masculino</option>
                    <option values="Feminino">Feminino</option>
                    <option values="Outro">Outro</option>
                    <option values="Prefiro não indicar">Prefiro não indicar</option>
                </Form.Select>

                <br/>
                <Container className='text-center'>
                    <Button type="submit"> Procurar </Button>
                    {'  '}
                    <Button > Reset </Button>
                </Container>
            </Form>

            <br/>
            <br/>
            <Container>
                <h3 className='text-center'> Resultados da sua procura: </h3>
                { usersAchados.length === 0 ? <p className='text-center'>Sem resultados</p> : (
                    <div>
                        <Table className='text-center' bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>NIF</th>
                                    <th>Nome</th>
                                    <th>Telemovel</th>
                                    <th>Mail</th>
                                    <th>Tipo de conta</th>
                                    <th>Estado da conta</th>
                                    <th>Ações possíveis</th>
                                </tr>
                            </thead>
                            <tbody>
                                { construirTabela }
                            </tbody>
                        </Table>   
                    </div>
        )}
            </Container>
        </>
    )
}

export default AdminGestaoUsers;
