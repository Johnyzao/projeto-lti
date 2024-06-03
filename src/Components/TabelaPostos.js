import React, { useState, useEffect } from 'react';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

function TabelaPostos() {

    const [postos, setPostos] = useState(new Array());
    const [postosBloqueados, setPostosBloqueados] = useState(new Set());
    const [erroInternoObterPosto, setErroInternoObterPosto] = useState(false);

    async function obterPostos() {
        await axios.get(
            config.LINK_API + "/policeStation",
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                console.log(res.data);
                setPostos(res.data);

            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
                    setErroInternoObterPosto(true);
                }
            }
        });
    }

    async function removerPosto(id) {
        await axios.delete(
            config.LINK_API + "/policeStation/" + id,
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                obterPostos();
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
                    setErroInternoObterPosto(true);
                }
            }
        });
    }

    async function verificarRemocaoValida(id){
        await axios.get(
            config.LINK_API + "/police/policeStation/" + id,
        ).then( ( res ) => {
            if ( !res.data ) {
                let novoSet = postosBloqueados.add(id);
                setPostosBloqueados( new Set(novoSet) );
            }
        })
    }

    async function removerPoliciasDoPosto(id){
        await axios.delete(
            config.LINK_API + "/police/policeStation/" + id,
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                obterPostos();
                setErroInternoObterPosto(false);
            }
        });
    }

    function bloquearRemocao(id) {
        verificarRemocaoValida(id);
        return postosBloqueados.has(id);
    }

    const escreverPostos = postos.map( posto => 
        ( <tr key={posto.id}>
            <td> {posto.id} </td>
            <td> {posto.codpostal} </td>
            <td> {posto.morada} </td>
            <td> {posto.localidade} </td> 
            <td> {posto.telefone} </td> 
            <td> <Button className='text-center' variant="danger"  disabled={ bloquearRemocao(posto.id)} onClick={ () => {removerPosto(posto.id)}}> Remover posto </Button> &nbsp; &nbsp;
                 <Button className='text-center' variant="warning" disabled={ !bloquearRemocao(posto.id)} onClick={ () => {removerPoliciasDoPosto(posto.id)}}> Remover todos os polícias deste posto </Button> 
            </td> 
        </tr> )
    );

    useEffect( () => { obterPostos() }, [] );
    return (
        <>  
            { postos.length === 0 ? <p className='text-center'>Não existem postos registados ainda no sistema</p> : (
            <div>
                <p> <span className='text-danger'>Atenção</span>: Apenas se pode remover um posto após terem sido apagadas todas as contas associadas ao mesmo. </p>
                <Table className='text-center' bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID Interno</th>
                            <th>Código Postal</th>
                            <th>Morada</th>
                            <th>Localidade</th>
                            <th>Telefone</th>
                            <th> </th>
                        </tr>
                    </thead>
                    <tbody>
                        { escreverPostos }
                    </tbody>
                </Table>   
            </div>
            )}
        </>
    )
}

export default TabelaPostos;
