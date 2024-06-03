import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupApagarContaAdmin(props) {

    const [sucessoApagar, setSucessoApagar] = useState(false);

    function apagarConta(userNif){
        axios.delete(
            config.LINK_API+"/user/" + userNif,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if (res.status === 200) {
                setSucessoApagar(true);
            }
        }).catch(function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function close(close) {
        return close;
    }

    return (
        <>
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
                    <p> Se escolher apagar a conta deste utilizador ela será apagada permanentemente. </p>
                    <br/>
                    { sucessoApagar ? (<p className='text-success'>Utilziador apagado com sucesso</p>) : null }
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={close} variant="primary">Cancelar</Button>
                    <Button onClick={() => {apagarConta(props.nif)}} variant="danger">Confirmar</Button>
                </Modal.Footer>
                </Modal.Dialog>
                </div>
                )}
            </Popup>
        </>
  )
}

export default PopupApagarContaAdmin;
