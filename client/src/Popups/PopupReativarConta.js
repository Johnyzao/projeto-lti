import {React, useState, useEffect} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupReativarConta(props) {
    const [insucessoReativar, setInsucessoReativar] = useState(false);
    const [sucessoReativarConta, setSucessoReativarConta] = useState(false);
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

    async function reativarUserAuth0(nif){
        let jsonComInfo = {
            "blocked": false,
            "connection": "Username-Password-Authentication"
        };

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

    function reativarConta(nif){
        axios.put(
            config.LINK_API+"/user/"+nif+"/reactivate",
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setSucessoReativarConta(true);
                reativarUserAuth0(nif);
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

    const desenharBotao = () => {
        if ( props.desativado === 1 || props.user === "a" ) {
            return ( <Button variant="success" disabled> Reativar conta </Button> )
        } else {
            return ( <Button variant="success"> Reativar conta </Button> )
        }
    }

    useEffect( () => { obterTokenAuth0() }, [] );
    return (
    <Popup trigger={ desenharBotao } modal>
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
