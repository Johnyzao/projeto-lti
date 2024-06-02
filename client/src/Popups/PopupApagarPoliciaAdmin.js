import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupApagarPoliciaAdmin(props) {

    const [tokenAuth, setTokenAuth] = useState("");
    const [sucessoApagar, setSucessoApagar] = useState(false);

    function obterTokenAuth0() {
        let jsonCreds = {
            "grant_type": "client_credentials",
            "client_id": "265wBrgSH3GDA6dHNZPYlpEiJM7Gl5S2",
            "client_secret": "srJBHxmqhcQGZroywI0aacKwxgSjApdC6K2nXVFxmTnASUN6G-95Jb_Y1jvLYRQi",
            "audience": "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/"
        }
        axios.post(
            "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/oauth/token",
            jsonCreds,
            { headers: { 'Content-Type': 'application/json' } },
        ).then((res) => {
            if (res.status === 200) {
                setTokenAuth(res.data.access_token);
            }
        })
    }

    async function adminApagarContaAuth0(id){
        await axios.delete(
            "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth0|" + id,
            { headers: { Authorization: `Bearer ${tokenAuth}` } },
        ).then( ( res ) => {
            if (res.status === 204) {

            }
        }).catch(function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
                if (codigo !== 204) {
                }
            }
        });
    }

    function apagarConta(id){
        axios.delete(
            config.LINK_API+"/police/" + id,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if (res.status === 200) {
                setSucessoApagar(true);
                setTimeout(() => {
                    setSucessoApagar(false);
                }, 5000);


                adminApagarContaAuth0(id);
            }
        }).catch(function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    const desenharBotao = () => {
        if ( props.removido === 1 ) {
            return ( <Button variant="danger" disabled> Apagar </Button> )
        } else {
            return ( <Button variant="danger"> Apagar </Button>  )
        }
    }

    useEffect( () => { obterTokenAuth0() }, [] );
    return (
        <>
            <Popup trigger={desenharBotao} modal>
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
                    { sucessoApagar ? (<p className='text-success text-center'>Polícia apagado com sucesso</p>) : null }
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={close} variant="primary">Cancelar</Button>
                    <Button onClick={() => {apagarConta(props.id)}} variant="danger">Confirmar</Button>
                </Modal.Footer>
                </Modal.Dialog>
                </div>
                )}
            </Popup>
        </>
  )
}

export default PopupApagarPoliciaAdmin;

