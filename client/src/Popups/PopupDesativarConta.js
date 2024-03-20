import {React, useState} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function PopupDesativarConta(props) {
    const navigate = useNavigate();
    const [insucesso, setInsucesso] = useState(false);

    function desativarConta(nif){
        axios.put(
            "http://localhost:3000/user/"+nif+"/deactivate",
            { headers: {'Content-Type': 'application/json'}},
            { validateStatus: function (status) {
                return true;
            }}
        ).then( ( res ) => {
            res.status === 200 
                ? setInsucesso(false) 
                : setInsucesso(true);
        });
    }

    const handleClick = () => {
        desativarConta(props.nif);
        if (!insucesso) {
            navigate("./deactivated");
        } 
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
            <p> Se desativar a sua conta pode voltar a reativá-la quando quiser, 
                basta voltar a efetuar login e vir a esta página. 
                Onde terá a possibilidade de a voltar a ativar.
            </p>
            { !insucesso ? null : ( <p className='text-danger'> Ocorreu um erro, por favor tente de novo. </p> ) }
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="secondary">Cancelar</Button>
            <Button onClick={handleClick} variant="success"> Confirmar </Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupDesativarConta;
