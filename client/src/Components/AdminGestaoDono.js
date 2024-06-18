import React, { useState, useEffect } from 'react';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import PopupEditarDono from '../Popups/PopupEditarDono';
import PopupRemoverDono from '../Popups/PopupRemoverDono';

function AdminGestaoDono() {

    const [objetosDoUser, setObjetosDoUser] = useState([]);
    const [objetosNaoEncontrados, setObjetosNaoEncontrados] = useState(false);

    const validate = values => {
        const errors = {};

        /** Verificacoes do NIF **/  
        validator.isVAT( values.nif, 'PT' ) && values.nif !== "" 
            ? delete errors.nif
            : errors.nif = "NIF inválido.";

        return errors;
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nif: "",
        },
        validate,
        onSubmit: values => {
            obterObjetosDoUser(values.nif);
        },
    });

    async function obterObjetosDoUser(nif) {
        await axios.get(
            config.LINK_API + "/user/" + nif + "/getOwnedObjects",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setObjetosDoUser( res.data.objs );
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 404 ) {
                    setObjetosDoUser([]);
                    setObjetosNaoEncontrados(true);

                    setTimeout(() => {
                        setObjetosNaoEncontrados( false );
                    }, 5000);
                }
            }
        });
    }

    const desenharTabela = objetosDoUser.map( obj => {
        return (
            <tr key={obj.id}>
                <td> {obj.nif} </td>
                <td> {obj.id} </td>
                <td> {obj.data} </td>
                <td> 
                    <PopupEditarDono id={obj.id} />
                    {'  '}
                    <PopupRemoverDono id={obj.id} nif={obj.nif} />
                </td>
            </tr>
        )
    });

    return (
        <>
            <Container className='bg-light' fluid="sm">
            <h3 className='text-center'> Gestão de posse de objetos </h3>

            <Form onSubmit={formik.handleSubmit} >
            <Form.Label htmlFor="nif">Nif de um user: </Form.Label>
                <Form.Control
                    id="nif"
                    name="nif"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nif}
                />
            {formik.errors.nif ? (
                <div className='text-danger'>{formik.errors.nif}</div>
            ) : null}

            <br/>
            <div className='text-center'>
                <button onClick={formik.handleSubmit} className="btn btn-outline-success my-2 my-sm-0" type="submit">Obter objetos</button>
            </div>
            <br/>

            { objetosNaoEncontrados ? (<p className='text-danger text-center'>Nenhum objeto pertence a este utilizador.</p>) : null}
            </Form>

            <h3>Objetos achados que o utilizador possui: </h3>
            <Table size='sm' striped bordered hover responsive className='text-center'>
                <thead>
                    <tr>
                        <th> NIF </th>
                        <th> ID do objeto </th>
                        <th> Data de registo </th>
                        <th> Ações </th>
                    </tr>
                </thead>
                <tbody>
                    { desenharTabela }
                </tbody>
            </Table>

            </Container>
        </>
    )
}

export default AdminGestaoDono;
