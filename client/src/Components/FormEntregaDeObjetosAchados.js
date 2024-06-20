import React, { useState, useEffect } from 'react';

import { useAuth0 } from "@auth0/auth0-react";

// Bootstrap
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

function FormEntregDeObjetosAchados() {

    async function obterEntregas() {
        await axios.get(
            config.LINK_API + "/",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {

            }
        }).catch( function (error) {
            if ( error.response ) {
            }
        });
    }

    useEffect( () => { obterEntregas() }, [] );
    return (
        <>
            <Container className='bg-light' fluid="sm">
            <h3 className='text-center'> Gestão de entregas </h3>
            <p>Nesta página pode marcar objetos que foram entregues.</p>

            <br/>

            <h3 className='text-center'> Objetos por entregar </h3>
            <Table size='sm' striped bordered hover responsive className='text-center'>
                <thead>
                    <tr>
                        <th> NIF </th>
                        <th> ID do objeto </th>
                        <th> Data do pedido </th>
                        <th> Estado </th>
                        <th> Ações </th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </Table>
            </Container>
        </>
    )
}

export default FormEntregDeObjetosAchados;
