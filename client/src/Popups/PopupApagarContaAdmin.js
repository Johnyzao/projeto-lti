import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupApagarContaAdmin(props) {

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

    async function adminApagarContaAuth0(nif){
        await axios.delete(
            "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth0|" + nif,
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

    function apagarConta(userNif){
        axios.delete(
            config.LINK_API+"/user/" + userNif,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if (res.status === 200) {
                setSucessoApagar(true);
                adminApagarContaAuth0(userNif);
            }
        }).catch(function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    const desenharBotao = () => {
        if ( props.desativado === 1 || props.user === "a" ) {
            return ( <Button variant="danger" disabled> Apagar conta </Button> )
        } else {
            return ( <Button variant="danger"> Apagar conta </Button>  )
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
