import React, { useState,useEffect } from 'react';

// Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

import { useFormik } from 'formik';

import {sort} from 'fast-sort';

function AdminGestaoPosse() {

    const [pedidos, setPedidos] = useState([])

    async function obterPedidos() {
        await axios.get(
            config.LINK_API + "/objectReclamations",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setPedidos(sort(res.data.objs).desc( obj => obj.id ));
            }
        }).catch( function (error) {
            if ( error.response ) {
            }
        });
    }

    // TODO: ...
    async function aceitarPedido() {

    }

    async function rejeitarPedido(nif, id) {
        await axios.delete(
            config.LINK_API + "/registerPossibleOwner/foundObject/" + id + "/user/" + nif,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 201 ) {
                obterPedidos();
            }
        }).catch( function (error) {
            if ( error.response ) {
            }
        });
    }

    const desenharTabela = pedidos.map( obj => {
        return (
            <tr key={obj.id}>
                <td> {obj.nif} </td>
                <td> {obj.id} </td>
                <td> {obj.data} </td>
                <td> 
                    <Button onClick={() => {aceitarPedido(obj.nif, obj.id)}} variant='success'> Aceitar </Button> 
                    <Button onClick={() => {rejeitarPedido(obj.nif, obj.id)}} variant='danger'> Rejeitar </Button> 
                </td>
            </tr>
        )
    });

    useEffect( () => { obterPedidos() }, [] );
    return (
        <>
            <Container className='bg-light' fluid="sm">
            <h3 className='text-center'> Gestão de pedidos de posse </h3>
            <p>Nesta página pode aprovar ou rejeitar pedidos de posse de um objeto achado.</p>

            <br/>

            <h3 className='text-center'> Pedidos ativos </h3>
            <Table size='sm' striped bordered hover responsive className='text-center'>
                <thead>
                    <tr>
                        <th> NIF </th>
                        <th> ID do objeto </th>
                        <th> Data do pedido </th>
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

export default AdminGestaoPosse;
