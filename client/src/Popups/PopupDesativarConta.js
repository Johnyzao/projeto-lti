import {React, useState, useEffect} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupDesativarConta(props) {
    const [insucessoDesativar, setInsucessoDesativar] = useState(false);
    const [tokenAuth, setTokenAuth] = useState("");

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

    async function desativarUserAuth0(nif){
        let jsonComInfo = {
            "blocked": true,
            "connection": "Username-Password-Authentication"
        };
        console.log(nif);
        console.log();

        await axios.patch(
                "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth0|" + nif,
                jsonComInfo,
                { headers: { Authorization: `Bearer ${tokenAuth}` } },
            ).then((res) => {
                if (res.status === 200) {
                    console.log("Atualizado");
                }
        });
    }

    function desativarConta(nif){
        axios.put(
            config.LINK_API+"/user/"+nif+"/deactivate",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            desativarUserAuth0(nif);
        }).catch( function(error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if (codigo === 404 || codigo === 500) {
                    setInsucessoDesativar(true);
                }
            }
        });
    }

    const desenharBotao = () => {
        if ( props.desativado === 1 || props.user === "a") {
            return ( <Button variant="warning" disabled> Desativar conta </Button> )
        } else {
            return ( <Button variant="warning"> Desativar conta </Button> )
        }
    }

    useEffect( () => { obterTokenAuth0() }, [] );
    return (
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
