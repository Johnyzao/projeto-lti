import { React, useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupVerInfoObjeto(props) {

    const {titulo, descricao, categoria} = props.objeto;

    return (
        <Popup trigger={<Button variant="secondary">Ver</Button>} modal>
        {close => (
          <div
            className="modal show"
            style={{ display: 'block', position: 'initial' }}
          >
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>Informações deste objeto</Modal.Title>
                <Button variant='danger' onClick={close}>
                  &times;
                </Button>
              </Modal.Header>

              <Modal.Body>
                <p>Título: {titulo}</p>
                <br/>
                <p>Descrição: {descricao}</p>
                <br/>
                <p>Localização: {} </p>
                <br/>
                <p>Categoria: {categoria} </p>
                <p>Campo: blabla</p>
              </Modal.Body>

            </Modal.Dialog>
          </div>
        )}
      </Popup>
    )
}

export default PopupVerInfoObjeto
