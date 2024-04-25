import React, { useState, useEffect } from 'react';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

function TabelaPolicias() {
    const [policias, setPolicias] = useState([]);
    const [erroInternoObterPolicias, setErroInternoObterPolicias] = useState(false);

    async function obterPolicias() {
        await axios.get(
            config.LINK_API + "/police",
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                console.log(res.data);
                setPolicias(res.data);
                setErroInternoObterPolicias(false);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
                    setErroInternoObterPolicias(true);
                }
            }
        });
    }

    async function obterPostoPorId(id) {
        await axios.get(
            config.LINK_API + "/policeStation/" + id,
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                return res.data;
            }

        });
    }

    async function removerPolicia(id) {
        await axios.delete(
            config.LINK_API + "/police/" + id,
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                obterPolicias();
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {

                }
            }
        });
    }

    const escreverPolicias = policias.map( policia => 
        ( <tr key={policia.id}>
            <td> {policia.id} </td>
            <td> {policia.nome} </td>
            <td> {policia.posto} </td>
            <td> <Button className='text-center' variant="danger" onClick={ () => {removerPolicia(policia.id)}}> Apagar conta </Button> </td> 
        </tr> )
    );

    useEffect( () => { obterPolicias() }, [] );

    return (
        <>  
        { policias.length === 0 ? <p className='text-center'>Não existem agentes registados ainda no sistema</p> : (
        <div>
            <Table className='text-center' bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID do Agente</th>
                        <th>Nome do Agente</th>
                        <th>Posto</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    { escreverPolicias }
                </tbody>
            </Table>   
        </div>
        )}
        </>
    );
}

export default TabelaPolicias;
