import {React, useState} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupApagarConta(props) {
    const navigate = useNavigate();
    const [insucesso, setInsucesso] = useState(false);

    function apagarConta(nif){
        axios.delete(
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
                    setInsucesso(true);
                }
            }
        });
    }

    const handleClick = () => {
        apagarConta(props.nif);
    }

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
            <p> Esta ação não é revertível. </p>
            <p> Se apagar a sua conta esta será perdida permanentemente 
                e terá de criar uma conta nova se desejar utilizar esta 
                aplicação de novo. </p>
            { !insucesso ? null : ( <p className='text-danger'> Ocorreu um erro, por favor tente de novo. </p> ) }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="secondary">Cancelar</Button>
            <Button onClick={handleClick} variant="success">Confirmar</Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupApagarConta;
