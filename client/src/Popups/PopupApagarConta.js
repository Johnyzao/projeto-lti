import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import { useFormik } from 'formik';

// Informacoes da API.
import config from '../config';

import Form from 'react-bootstrap/Form';

function PopupApagarConta(props) {

    useEffect( () => { setInsucessoApagar(false) }, [] );

    const navigate = useNavigate();
    const [insucessoApagar, setInsucessoApagar] = useState(false);
    const [erroValidarPass, setErroValidarPass] = useState(false);

    async function apagarConta(nif){
        await axios.delete(
            config.LINK_API+"/user/" + nif,
            { headers: {'Content-Type': 'application/json'}},
            { validateStatus: function (status) {
                return true;
            }}
        ).then( ( res ) => {
            if (res.status === 200) {
                localStorage.clear();
                navigate("/accountDeleted");
            }
        }).catch(function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
                if (codigo === 500 || codigo === 404) {
                    setInsucessoApagar(true);
                    setTimeout(() => {
                        setInsucessoApagar( false );
                    }, 5000);
                }
            }
        });
    }

    async function confirmarPassword(nif, pass) {
        await axios.post(
            config.LINK_API+"/user/" + nif + "/verifyPassword",
            {pass:pass},
            { headers: {'Content-Type': 'application/json'}}
        ).then( (res) => {
            
            if ( res.status === 200 ) {
                setErroValidarPass(false);
                setInsucessoApagar(false);
                console.log("aqui2");
            }

        }).catch(function(error){
            let codigo = error.response.status;
            if (codigo === 401) {
                setInsucessoApagar(false);
                setErroValidarPass(true);
                console.log("aqui");
            }

            if (codigo === 500) {
                setInsucessoApagar(true);
                setTimeout(() => {
                    setInsucessoApagar( false );
                }, 5000);
            }
        });
    }

    const validate = values => {
        const errors = {};

        if ( values.pass === "" ) {
            errors.pass = "Por favor introduza a sua password."
        } else {
            confirmarPassword(props.nif, values.pass);
            erroValidarPass 
                ? errors.pass = "Password errada."
                : delete errors.pass;
        }

        return errors;
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            pass: ""
        },
        validate,
        onSubmit: values => {
            apagarConta(props.nif);
        },
    });

    return (
    <Popup trigger={<Button variant="danger"> Apagar conta </Button>} modal>
    {close => (
        <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}
        >
        <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Atenção</Modal.Title>
            <Button variant='danger' onClick={close}>
              &times;
            </Button>
        </Modal.Header>

        <Modal.Body>
            <Form onSubmit={formik.handleSubmit}>
                <Form.Label htmlFor="pass">Password: </Form.Label>
                <Form.Control
                    id="pass"
                    name="pass"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pass}
                />
                {formik.touched.pass && formik.errors.pass 
                    ? ( <div className='text-danger'>{formik.errors.pass}</div>)   
                    : null}
            </Form>
            <br/>
            <br/>

            <p> Esta ação não é revertível. </p>
            <p> Se apagar a sua conta esta será perdida permanentemente 
                e terá de criar uma conta nova se desejar utilizar esta 
                aplicação de novo. </p>
            { !insucessoApagar ? null : ( <p className='text-danger'> Ocorreu um erro, por favor tente de novo. </p> ) }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="secondary">Cancelar</Button>
            <Button onClick={formik.handleSubmit} variant="success">Confirmar</Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupApagarConta;