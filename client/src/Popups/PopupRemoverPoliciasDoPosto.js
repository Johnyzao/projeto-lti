import {React, useState} from 'react';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function PopupRemoverPoliciasDoPosto(props) {

    const [sucessoApagarPosto, setSucessoApagarPosto] = useState(false);

    async function removerPoliciasDoPosto(id){
        await axios.delete(
            config.LINK_API + "/police/policeStation/" + id,
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setSucessoApagarPosto(true);
                setTimeout(() => {
                    setSucessoApagarPosto(false);
                }, 5000);
            }
        });
    }

    return (
    <Popup trigger={<Button variant='warning'> Remover polícias </Button>} modal>
    {close => (
        <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}
        >
        <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Confirmar remoção</Modal.Title>
            <Button variant='danger' onClick={close}>
              &times;
            </Button>
        </Modal.Header>

        <Modal.Body>
            <p> Tem a certeza que pretende remover todos os polícias associados a este posto? </p>
            { sucessoApagarPosto ? (<p className='text-success text-center'>Polícias apagado com sucesso</p>) : null }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="secondary">Cancelar</Button>
            <Button onClick={() => { removerPoliciasDoPosto(props.id) }} variant="warning">Confirmar</Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupRemoverPoliciasDoPosto;
