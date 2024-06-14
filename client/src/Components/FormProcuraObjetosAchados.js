import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Informacoes da API.
import config from '../config';

import { useFormik } from 'formik';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// Imports do bootstrap.
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';


// TODO: 
//  - Ter um component que mostra os objetos perdidos do utilizador;
//  - Seleciona-se um desses objetos;
//  - E obtém-se os matches;
//  - De seguida pode clicar-se num botão para mostrar as diferenças;
function FormProcuraObjetosAchados(props) {

    const [objetos, setObjetos] = useState([]);
    const [objetoSelecionado, setObjetoSelecionado] = useState(0);
    const [objetosAchadosEncontrados, setObjetosAchadosEncontrados] = useState([]);
    const [afinidadeMaxima, setAfinidadeMaxima] = useState(0);

    function obterTodosOsObjetos(nifUser) {
        axios.get(
            config.LINK_API + "/lostObject/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetos(res.data.objPerdidos);
            setObjetoSelecionado( res.data.objPerdidos[0].id );
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    async function obterMatches(idObjPerdido) {
        await axios.get(
            config.LINK_API + "/lostObject/" + idObjPerdido + "/getMatches" ,
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setAfinidadeMaxima(res.data.afMaxima);
            setObjetosAchadosEncontrados(res.data.objetos);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    const formik = useFormik({
        initialValues: {},
        onSubmit: values => {   
            obterMatches( objetoSelecionado );
        }
    });

    const desenharObjetosPerdidos = objetos.map( obj => {
        return (
        <option key={obj.id} value={obj.id}> 
            (Registado em {obj.dataregisto}): {obj.titulo}
        </option>
        );
    });

    const desenharMatches = objetosAchadosEncontrados.map( obj => {
        let nivelDeMatch = (obj.afinidade/afinidadeMaxima).toFixed(2) * 100;
        return (
            <div key={obj.id} className='w-100 p-3'>
                <ListGroup.Item>  
                    <a className="list-group-item list-group-item-action flex-column align-items-start">
                        <div className="d-flex w-100 justify-content-between"> {obj.titulo} </div>
                            <p className="mb-1">{obj.descricao}</p>
                        <small className="text-muted"> Nível de match: {nivelDeMatch}% </small>
                        <br/>
                        <small className="text-muted"> Registado em {obj.dataregisto} </small>
                    </a>
                </ListGroup.Item>
            </div>
        );
    });

    // Substituir por props.nif aqui...
    useEffect( () => { obterTodosOsObjetos(177777052) }, [] );

    return (
        <>
            <Container className='bg-light' fluid="sm">

                <h1>Procura correspondências</h1>
                <br/>

                <Form onSubmit={formik.handleSubmit} >

                <Form.Label htmlFor="objetoPerdido">Objeto perdido:<span className='text-danger'>*</span> </Form.Label>
                    <Form.Select                    
                    id="objetoPerdido"
                    name="objetoPerdido"
                    onChange={(e) => {setObjetoSelecionado(e.target.value);}}>
                        { desenharObjetosPerdidos }
                </Form.Select>

                <br/>
                <div className='text-center'>
                    <button onClick={formik.handleSubmit} className="btn btn-outline-success my-2 my-sm-0" type="submit">Procurar</button>
                </div>
                </Form>

                {/* Objetos encontrados aqui... */}
                <br/>
                { objetosAchadosEncontrados.length > 0 ? (<h2> Objetos achados correspondentes </h2>) : null }
                <Container>
                    <ListGroup variant='flush' className="d-flex justify-content-between align-items-start">
                        { desenharMatches }
                    </ListGroup>
                </Container>
            </Container>
        </>
    )
}

export default FormProcuraObjetosAchados
