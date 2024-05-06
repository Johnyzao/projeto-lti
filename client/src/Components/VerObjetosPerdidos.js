import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import validator from 'validator';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

function VerObjetosPerdidos(props) {

    const [objetos, setObjetos] = useState([]);

    function obterEstadoObjetoPerdido(id) {
        let estado = false;
        axios.get(
            config.LINK_API + "/lostObject/" + id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            let dadosObj = res.data.objPerdido;
            if ( dadosObj.objetoachado !== null ) {
                estado = true
            }
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });

        return estado;
    }


    function obterTodosOsObjetos(nifUser) {
        axios.get(
            config.LINK_API + "/lostObject/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetos(new Array(res.data.objPerdido));
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }
    useEffect( () => { obterTodosOsObjetos(props.nif) }, [] );

    const desenharObjetosPerdidos = objetos.map( objeto => {
        console.log( obterEstadoObjetoPerdido(objeto.id) );
        return (<div key={objeto.id} className="list-group">
            <a href="#" className="list-group-item list-group-item-action flex-column align-items-start">
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{objeto.titulo}</h5>
                    <small className="text-muted">Registado em {objeto.dataregisto}</small>
                </div>
            <p className="mb-1">{objeto.descricao}</p>

            { obterEstadoObjetoPerdido(objeto.id)
                ? (<small className="text-muted"> O seu objeto foi achado </small>)
                : (<small className="text-muted"> Este objeto ainda não foi achado. </small>)
            }
            </a>
            <br/>
            </div>
        );
    })

    return (
        <>
            <div>
                { desenharObjetosPerdidos }
            </div>
        </>
    );
}

export default VerObjetosPerdidos;
