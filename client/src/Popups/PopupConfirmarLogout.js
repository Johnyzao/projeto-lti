import {React} from 'react';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// React router
import { Link } from 'react-router-dom';

// Auth0
import { useAuth0 } from "@auth0/auth0-react";

function PopupApagarConta() {
    const { logout } = useAuth0();

    return (
    <Popup trigger={<Link> Logout </Link>} modal>
    {close => (
        <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}
        >
        <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Confirmar Logout</Modal.Title>
            <Button variant='danger' onClick={close}>
              &times;
            </Button>
        </Modal.Header>

        <Modal.Body>
            <p> Tem a certeza que pretende efetuar logout da sua conta? </p>
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="secondary">Cancelar</Button>
            <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} variant="success">Confirmar</Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupApagarConta;
