import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import Button from 'react-bootstrap/Button';

function VerObjetosPerdidos(props) {
    console.log("AQUI");
    console.log(props.nif);
    const navigate = useNavigate();

    const [objetos, setObjetos] = useState([]);
    const [objetoPerdidoApagado, setObjetoPerdidoApagado] = useState(false);

    function removerObjetoPerdido(id) {
        axios.delete(
            config.LINK_API + "/lostObject/" + id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            if ( res.status === 200 ) {
                setObjetoPerdidoApagado(true);

                setTimeout(() => {
                    setObjetoPerdidoApagado(false);
                }, 1000);
            }
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function obterObjetoPerdido(idObjetoPerido) {
        axios.get(
            config.LINK_API + "/lostObject/" + idObjetoPerido, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function obterTodosOsObjetos(nifUser) {
        axios.get(
            config.LINK_API + "/lostObject/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetos(res.data.objPerdidos);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }
    //useEffect( () => { obterTodosOsObjetos(props.nif) }, [] );
    useEffect( () => { obterTodosOsObjetos(props.nif) }, [objetoPerdidoApagado] );

    const desenharObjetosPerdidos = objetos.map( objeto => {

        axios.get(
            config.LINK_API + "/lostObject/" + objeto.id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            objeto['idObjPerdido'] = res.data.objPerdido.idperdido;
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });

        return (<div key={objeto.id} className="list-group">
            <a href="#" className="list-group-item list-group-item-action flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{objeto.titulo}</h5>
                    <small className="text-muted"> <Button onClick={() => { navigate("/lostObject/edit/" + objeto.id) }}>Editar</Button> <Button onClick={() => {removerObjetoPerdido(objeto.idObjPerdido)}} variant='danger'>Remover</Button> </small>
                </div>
            <p className="mb-1">{objeto.descricao}</p>
            <small className="text-muted"> Registado em {objeto.dataregisto} </small>
            </a>
            <br/>
            </div>
        );
    })

    return (
        <>
            { desenharObjetosPerdidos }
        </>
    );
}

export default VerObjetosPerdidos;
