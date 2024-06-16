import React, { useState,useEffect } from 'react';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupMostrarDiferencas(props) {

    const [pagina, setPagina] = useState("gerais");
    const [camposPerdidos, setCamposPerdidos] = useState([]);
    const [camposAchados, setCamposAchados] = useState([]);

    async function obterCamposPerdido(id) {
        axios.get(
            config.LINK_API + "/object/atributes/" + id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setCamposPerdidos(res.data);
            console.log("PERDIDO:");
            console.log(res.data);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    async function obterCamposAchado(id) {
        axios.get(
            config.LINK_API + "/object/atributes/" + id, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setCamposAchados(res.data);
            console.log("ACHADO:");
            console.log(res.data);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function desenharCampos() {
        let maiorTamanho = Math.max(camposPerdidos.length, camposAchados.length);
        let render = [];

        for(let id = 0; id < maiorTamanho; id++) {
            render.push(<tr>
                <td> { camposPerdidos.length === maiorTamanho ? camposPerdidos[id].campo : camposAchados[id].campo } </td>
                <td> { camposPerdidos[id].valor === '' ? "Não especificado" : camposPerdidos[id].valor}</td>
                <td> { camposAchados[id].valor === '' ? "Não especificado" : camposAchados[id].valor}</td>
                <td> { (camposPerdidos[id].valor !== camposAchados[id].valor) ? "Sim" : "Não" }</td>
            </tr>)
        }

        return render;
    }

    useEffect( () => { obterCamposPerdido(props.perdido.id) }, [props.perdido] );
    useEffect( () => { obterCamposAchado(props.achado.id) }, [props.achado] );

    return (
        <Popup trigger={<Button className="btn btn-primary"> Mostrar diferenças </Button>} modal>
            {close => (
                
                <div
                className="modal show"
                style={{ display: 'block', position: 'initial' }}
                >
                
                <Modal.Dialog className='modal-dialog' >
                <Modal.Header>
                    <Modal.Title>Diferenças</Modal.Title>
                    <Button variant='danger' onClick={close}>
                        &times;
                    </Button>
                </Modal.Header>
        
                <Modal.Body>
                    <div>
                    <p>Escolha uma categoria para ver as diferenças:</p>
                    <Pagination>
                        <Pagination.Item onClick={()=>{setPagina("gerais")}}  active={pagina === "gerais"}>Gerais</Pagination.Item>
                        <Pagination.Item onClick={()=>{setPagina("locs")}}    active={pagina === "locs"}>Localização</Pagination.Item>
                        <Pagination.Item onClick={()=>{setPagina("campos")}}  active={pagina === "campos"}>Campos</Pagination.Item>
                    </Pagination>
                    </div>

                    {
                        pagina === "gerais" ? (
                            <>
                            <h5>Diferenças gerais entre os dois objetos</h5>
                            <Table size='sm' striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Objeto perdido</th>
                                        <th>Objeto achado</th>
                                        <th>Diferença?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Título</td>
                                        <td>{props.perdido.titulo}</td>
                                        <td>{props.achado.titulo}</td>
                                        <td>{ (props.perdido.titulo !== props.achado.titulo) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Descrição</td>
                                        <td>{props.perdido.descricao}</td>
                                        <td>{props.achado.descricao}</td>
                                        <td>{ (props.perdido.descricao !== props.achado.descricao) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Categoria</td>
                                        <td>{props.perdido.categoria}</td>
                                        <td>{props.achado.categoria}</td>
                                        <td>{ (props.perdido.categoria !== props.achado.categoria) ? "Sim" : "Não" }</td>
                                    </tr>
                                </tbody>
                            </Table>
                            </>
                        ) : null
                    }

                    {
                        pagina === "locs" ? (
                            <>
                            <h5>Diferenças localizacionais entre os dois objetos</h5>
                            <Table size='sm' striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Objeto perdido</th>
                                        <th>Objeto achado</th>
                                        <th>Diferença?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Distrito</td>
                                        <td>{props.locPerdido.dist === null ? "Não especificado" : props.locPerdido.dist}</td>
                                        <td>{props.locAchado.dist === null ? "Não especificado" : props.locAchado.dist}</td>
                                        <td>{ (props.locPerdido.dist !== props.locAchado.dist) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Município</td>
                                        <td>{props.locPerdido.munc === null ? "Não especificado" : props.locPerdido.munc}</td>
                                        <td>{props.locAchado.munc === null ? "Não especificado" : props.locAchado.munc}</td>
                                        <td>{ (props.locPerdido.munc !== props.locAchado.munc) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Freguesia</td>
                                        <td>{props.locPerdido.freg === null ? "Não especificado" : props.locPerdido.freg}</td>
                                        <td>{props.locAchado.freg === null ? "Não especificado" : props.locAchado.freg}</td>
                                        <td>{ (props.locPerdido.freg !== props.locAchado.freg ? "Sim" : "Não") }</td>
                                    </tr>
                                    <tr>
                                        <td>Rua</td>
                                        <td>{props.locPerdido.rua === null ? "Não especificado" : props.locPerdido.rua}</td>
                                        <td>{props.locAchado.rua === null ? "Não especificado" : props.locAchado.rua}</td>
                                        <td>{ (props.locPerdido.rua !== props.locAchado.rua) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Morada</td>
                                        <td>{props.locPerdido.morada  === null ? "Não especificado" : props.locPerdido.morada}</td>
                                        <td>{props.locAchado.morada  === null ? "Não especificado" : props.locAchado.morada}</td>
                                        <td>{ (props.locPerdido.morada !== props.locAchado.morada) ? "Sim" : "Não" }</td>
                                    </tr>
                                    <tr>
                                        <td>Código postal</td>
                                        <td>{props.locPerdido.codp  === null ? "Não especificado" : props.locPerdido.codp}</td>
                                        <td>{props.locAchado.codp  === null ? "Não especificado" : props.locAchado.codp}</td>
                                        <td>{ (props.locPerdido.codp !== props.locAchado.codp) ? "Sim" : "Não" }</td>
                                    </tr>
                                </tbody>
                            </Table>
                            </>
                        ) : null
                    }

                    {
                        pagina === "campos" ? (
                            <>
                            <h5>Diferenças nos campos entre os dois objetos</h5>
                            <Table size='sm' striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Objeto perdido</th>
                                        <th>Objeto achado</th>
                                        <th>Diferença?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        desenharCampos()
                                    }
                                </tbody>
                            </Table>
                            </>
                        ) : null
                    }
                </Modal.Body>
                </Modal.Dialog>
            </div>
            )}
        </Popup>
    )
}

export default PopupMostrarDiferencas;
