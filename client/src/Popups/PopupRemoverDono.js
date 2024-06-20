import React, { useState } from 'react';

// Bootstrap
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';


// Informacoes da API.
import config from '../config';


function PopupRemoverDono(props) {

    const [registado, setRegistado] = useState(false);
    const [desativarBotao, setDesativarBotao] = useState(false);

    async function removerDono(nif, id) {
        await axios.delete(
            config.LINK_API + "/deleteOwner/"+nif+"/foundObject/" + id,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {
            if ( res.status === 200 ) {
                setRegistado(true);
                setDesativarBotao(true);

                setTimeout(() => {
                    setRegistado( false );
                }, 5000);
            }
        }).catch( function (error) {
            if ( error.response ) {
            }
        });
    }

    return (
        <>
        <Popup trigger={ <Button disabled={desativarBotao} variant='danger'> Remover dono </Button>
        } modal>
            {close => (
                
                <div
                className="modal show"
                style={{ display: 'block', position: 'initial' }}
                
                >
                <Modal.Dialog scrollable={true}>
                <Modal.Header>
                    <Modal.Title>Editar dono</Modal.Title>
                    <Button variant='danger' onClick={close}>
                        &times;
                    </Button>
                </Modal.Header>
                
                <Modal.Body>
                    <p>Ao remover o dono deste objeto, o mesmo irá voltar a ser pesquisável.</p> 


                    { registado === true ? (<p className='text-success text-center'> Dono apagado com sucesso. </p>) : null}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="danger">Cancelar</Button>
                    <Button disabled={desativarBotao} onClick={() => {removerDono(props.nif, props.id)}}>Apagar dono</Button>
                </Modal.Footer>
                </Modal.Dialog>
            </div>
            )}
        </Popup>
        </>
    )
}

export default PopupRemoverDono
