import React, { useState,useEffect } from 'react';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

import { useFormik } from 'formik';

function PopupReclamarObjeto(props) {

    const [registado, setRegistado] = useState(false);
    const [desativarBotao, setDesativarBotao] = useState(false);

    const validate = values => {
        return {};
    }

    const formik = useFormik({
        initialValues: {},
        validate,
        onSubmit: values => {
            submeterReclamacao(props.nif.sub.split("|")[1], props.id);
    }});

    async function submeterReclamacao(nif, idObj) {

        let dataAtual = new Date();
        let dia = dataAtual.getDate();
        let mes = dataAtual.getMonth() + 1;
        let ano = dataAtual.getFullYear();

        await axios.post(
            config.LINK_API + "/registerPossibleOwner/foundObject/",
            {nifDono: nif, idObj: idObj, date: (dia + "/" + mes + "/" + ano)},
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            if ( res.status === 201 ) {
                setRegistado(true);
                setDesativarBotao(true);
                setTimeout(() => {
                    setRegistado( false );
                }, 5000);
            }
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    return (
        <Popup trigger={
            props.desativado === true 
                ? (<Button disabled > Já reclamou este objeto</Button>) 
                : <Button disabled={ (new Date().getTime() > props.dataRegisto) || desativarBotao ? true : false}> Reclamar objeto </Button>
        } modal>
            {close => (
                
                <div
                className="modal show"
                style={{ display: 'block', position: 'initial' }}
                
                >
                <Modal.Dialog scrollable={true}>
                <Modal.Header>
                    <Modal.Title>Reclamar objeto</Modal.Title>
                    <Button variant='danger' onClick={close}>
                        &times;
                    </Button>
                </Modal.Header>
                
                <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <p>Se este objeto é seu, clique no botão para submeter um pedido de reclamação do objeto.</p> 
                    <p>A partir deste pedido um agente da polícia decidirá aprovar ou negar o seu pedido.</p>
                    <p>Atenção, o uso indevido da reclamação de objetos pode levar à sua suspensão indefinida da plataforma.</p>

                    { registado === true ? (<p className='text-success text-center'> Pedido registado com sucesso. </p>) : null}
                </Modal.Body>
                </Form>

                <Modal.Footer>
                    <Button variant="danger">Cancelar</Button>
                    <Button onClick={formik.handleSubmit} disabled={desativarBotao} variant="success">Efetuar pedido</Button>
                </Modal.Footer>
                </Modal.Dialog>
            </div>
            )}
        </Popup>
    )
}

export default PopupReclamarObjeto
