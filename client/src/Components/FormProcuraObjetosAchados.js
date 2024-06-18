import React, { useState,useEffect } from 'react';

// Informacoes da API.
import config from '../config';

import { useFormik } from 'formik';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

import PopupMostrarDiferencas from '../Popups/PopupMostrarDiferencas';
import PopupReclamarObjeto from '../Popups/PopupReclamarObjeto';

// TODO: Trocar para o Auth0...
function FormProcuraObjetosAchados(props) {
    // Trocar o props para obter o Auth0!!!

    const [objetos, setObjetos] = useState([]);
    const [objetoSelecionado, setObjetoSelecionado] = useState(0);
    const [localizacoesMatches, setLocalizacoesMatches] = useState({});
    const [localizacaoPerdido, setLocalizacaoPerdido] = useState({});
    const [objetosAchadosEncontrados, setObjetosAchadosEncontrados] = useState([]);
    const [objetosDesativados, setObjetosDesativados] = useState({});
    const [afinidadeMaxima, setAfinidadeMaxima] = useState(0);

    function obterTodosOsObjetos(nifUser) {
        axios.get(
            config.LINK_API + "/lostObject/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetos(res.data.objPerdidos);
            setObjetoSelecionado( res.data.objPerdidos[0] );
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
            setLocalizacoesMatches(res.data.locs);
            setLocalizacaoPerdido(res.data.locPerdido);
            console.log(res.data.locPerdido);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    async function verificarObjetosJaReclamados(nifUser) {
        await axios.get(
            config.LINK_API + "/objectReclamations/user/" + nifUser, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetosDesativados( res.data.objs );
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    const formik = useFormik({
        initialValues: {},
        onSubmit: values => {   
            obterMatches( objetoSelecionado.id );
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
        let dataLista = obj.dataregisto.split("/");
        let dataRegisto = new Date(dataLista[2], ""+(parseInt(dataLista[1])-1), dataLista[0]);
        dataRegisto.setDate(dataRegisto.getDate() + 7);

        return (
            <div key={obj.id} className='w-100 p-3'>
                <ListGroup.Item>  
                    <a className="list-group-item list-group-item-action flex-column align-items-start">
                        <div className="d-flex w-100 justify-content-between"> {obj.titulo} </div>
                            <p className="mb-1">{obj.descricao}</p>
                        <small className="text-muted"> Nível de match: {nivelDeMatch}% </small>
                        <br/>
                        <small className="text-muted"> Registado em {obj.dataregisto} </small>
                        <br/>
                        <br/>
                        <div className='text-center'>
                            <PopupMostrarDiferencas 
                                perdido={objetoSelecionado} 
                                achado={obj} 
                                locAchado={localizacoesMatches[obj.id]} 
                                locPerdido={localizacaoPerdido}
                            /> &nbsp; &nbsp;
                            {/** TROCAR PARA AUTH0 AQUI!!! */}
                            <PopupReclamarObjeto 
                                nif={177777052} 
                                id={obj.id} 
                                dataRegisto={dataRegisto.getTime()} 
                                desativado={ objetosDesativados[""+obj.id] === true ? true : false }
                            />
                        </div>
                    </a>
                </ListGroup.Item>
            </div>
        );
    });

    // Substituir por props.nif aqui...
    useEffect( () => { obterTodosOsObjetos(177777052) }, [] );
    useEffect( () => { verificarObjetosJaReclamados(177777052) }, [] );

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
