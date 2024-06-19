import React, { useState,useEffect } from 'react';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

import validator from 'validator';

// Informacoes da API.
import config from '../config';

import { useFormik } from 'formik';

function PopupEditarDono(props) {

    const [registado, setRegistado] = useState(false);
    const [desativarBotao, setDesativarBotao] = useState(false);

    async function editarDono(novoNif, id) {
        await axios.put(
            config.LINK_API + "/editOwner/foundObject",
            {nifDono: novoNif, idObj: id},
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setRegistado(true);
                setDesativarBotao(true);

                setTimeout(() => {
                    setRegistado( false );
                }, 5000);
            }
        }).catch( function (error) {
            if ( error.response ) {
            }
        });
    }

    const validate = values => {
        const errors = {};

        /** Verificacoes do NIF **/  
        validator.isVAT( values.nif, 'PT' ) && values.nif !== "" 
            ? delete errors.nif
            : errors.nif = "NIF inválido.";

        return errors;
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nif: ""
        },
        validate,
        onSubmit: values => {
            editarDono(values.nif, props.id);
    }});


    return (
        <>
        <Popup trigger={ <Button disabled={desativarBotao} > Editar dono </Button>
        } modal>
            {close => (
                
                <div
                className="modal show"
                style={{ display: 'block', position: 'initial' }}
                
                >
                <Modal.Dialog scrollable={true}>
                <Modal.Header>
                    <Modal.Title>Editar dono</Modal.Title>
                    <Button variant='danger' onClick={close}>
                        &times;
                    </Button>
                </Modal.Header>
                
                <Form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <p>Indique o nif do novo utilizador que será o dono deste objeto de aqui em diante.</p> 

                    <Form.Label htmlFor="nif">Nif do novo dono: </Form.Label>
                        <Form.Control
                            id="nif"
                            name="nif"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.nif}
                        />
                    {formik.errors.nif ? (
                        <p className='text-danger'>{formik.errors.nif}</p>
                    ) : null}

                    { registado === true ? (<p className='text-success text-center'> Dono alterado com sucesso. </p>) : null}
                </Modal.Body>
                </Form>

                <Modal.Footer>
                    <Button variant="danger">Cancelar</Button>
                    <Button onClick={formik.handleSubmit} disabled={desativarBotao} variant="success">Alterar dono</Button>
                </Modal.Footer>
                </Modal.Dialog>
            </div>
            )}
        </Popup>
        </>
    )
}

export default PopupEditarDono
