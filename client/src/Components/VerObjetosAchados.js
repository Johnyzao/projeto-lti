import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import PopupVerInfoObjeto from '../Popups/PopupVerInfoObjeto';

function VerObjetosAchados(props) {
    const navigate = useNavigate();

    const [objetosAchados, setObjetosAchados] = useState([]);
    const [objetoAchadoApagado, setObjetoAchadoApagado] = useState(false);

    function removerObjetoAchado(id) {
        axios.delete(
            config.LINK_API + "/foundObject/" + id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            if ( res.status === 200 ) {
                setObjetoAchadoApagado(true);

                setTimeout(() => {
                    setObjetoAchadoApagado(false);
                }, 1000);
            }
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
        //window.location.reload();
    }

    // function obterObjetoAchado(idObjetoPerido) {
    //     axios.get(
    //         config.LINK_API + "/foundObject/" + idObjetoPerido, 
    //         { headers: {'Content-Type': 'application/json'}},
    //     ).then ( (res) => {
    //     }).catch(function (error) {
    //         if ( error.response ) {
    //             let codigo = error.response.status;
    //         }
    //     });
    // }

    function obterTodosOsObjetos(nifUser) {
        axios.get(
            config.LINK_API + "/foundObject/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetosAchados(res.data.objAchados);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    useEffect( () => { obterTodosOsObjetos(props.nif) }, [objetoAchadoApagado] );

    const desenharObjetosAchados = objetosAchados.map( objeto => {

        axios.get(
            config.LINK_API + "/foundObject/" + objeto.id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            objeto['idObjAchado'] = res.data.objAchado.idachado;
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });

        return (<div key={objeto.id} className="list-group">
            <a href="#" className="list-group-item list-group-item-action flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{objeto.titulo}</h5>
                    <small className="text-muted"> <PopupVerInfoObjeto objeto={objeto}/> <Button onClick={() => { navigate("/foundObject/edit/" + objeto.id) }}>Editar</Button> <Button onClick={() => {removerObjetoAchado(objeto.idObjAchado)}} variant='danger'>Remover</Button> </small>
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
            <div>
                { desenharObjetosAchados }
            </div>
        </>
    );
}

export default VerObjetosAchados;
