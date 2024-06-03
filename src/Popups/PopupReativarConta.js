import {React, useState} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupReativarConta(props) {
    const [insucessoReativar, setInsucessoReativar] = useState(false);
    const [sucessoReativarConta, setSucessoReativarConta] = useState(false);

    function reativarConta(nif){
        axios.put(
            config.LINK_API+"/user/"+nif+"/reactivate",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setSucessoReativarConta(true);
            }
        }).catch( function(error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if (codigo === 404 || codigo === 500) {
                    setInsucessoReativar(true);
                }
            }
        });
    }

    return (
    <Popup trigger={<Button variant="success"> Reativar conta </Button>} modal>
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
            { sucessoReativarConta ? (<p className='text-success'> Conta com o Nif {props.nif} reativada com sucesso </p>) : null }
            { insucessoReativar ? ( <p className='text-danger'> Ocorreu um erro, por favor tente de novo. </p> ) : null }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="primary">Cancelar</Button>
            <Button onClick={() => {reativarConta(props.nif)}} variant="success"> Confirmar </Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupReativarConta;
