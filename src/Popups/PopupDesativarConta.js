import {React, useState} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupDesativarConta(props) {
    const [insucessoDesativar, setInsucessoDesativar] = useState(false);

    function desativarConta(nif){
        axios.put(
            config.LINK_API+"/user/"+nif+"/deactivate",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {

            }
        }).catch( function(error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if (codigo === 404 || codigo === 500) {
                    setInsucessoDesativar(true);
                }
            }
        });
    }

    return (
    <Popup trigger={<Button variant="warning"> Desativar conta </Button>} modal>
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
            <p> Se desativar a esta conta pode voltar a reativá-la quando quiser.
            </p>
            { insucessoDesativar ? ( <p className='text-danger'> Ocorreu um erro, por favor tente de novo. </p> ) : null }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="primary">Cancelar</Button>
            <Button onClick={() => {desativarConta(props.nif)}} variant="danger"> Confirmar </Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupDesativarConta;
