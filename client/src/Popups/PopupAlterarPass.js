import {React, useState} from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useFormik } from 'formik';
import Form from 'react-bootstrap/Form';
import validator from 'validator';

// https://www.npmjs.com/package/react-password-strength-bar

import axios from 'axios';

function PopupAlterarPass(props) {
  const [insucesso, setInsucesso] = useState(false);
  const [erroInterno, setErroInterno] = useState(false);
  const [alterado, setAlterado] = useState(false);

  async function atualizarPassword(pass, nif) {
    await axios.put(
      "http://localhost:3000/user/"+nif+"/changePassword",
      {novaPass: pass},
      { headers: {'Content-Type': 'application/json'} },
      { validateStatus: function (status) {
          return true;
      }}
    ).then( ( res ) => {
      if ( res.status === 200 ) {
        setInsucesso(false);
      }

      if ( res.status === 401 ) {
        setInsucesso(true);
      }

      if ( res.status === 500 ) {
        setErroInterno(true);
        setInsucesso(true);
      }
  });
  }

  const validate = values => {
    const errors = {};

    if ( values.passAtual === "" ) {
        errors.passAtual = "Por favor insira a sua password atual.";
    }

    if ( values.passNova === "" ) {
      errors.passAtual = "Por favor insira uma password nova.";
    }

    validator.isStrongPassword( values.passNova ) 
        ? errors.passNova = ""  
        : errors.passNova = "Password fraca, por favor introduza uma nova.";

    values.passAtual === values.confirmacao
        ? errors.confirmacao = ""
        : errors.confirmacao = "Passwords são diferentes, por favor escreva a mesma password."

    insucesso 
        ? errors.passAtual = "Password errada, por favor insira a sua password atual"
        : errors.passAtual = "";

    return errors;
  }

  const formik = useFormik({
    initialValues: {
      passAtual: "",
      passNova: "",
      confirmacao: ""
    },
    validateOnChange:false,
    validateOnBlur:false,
    validate,
    onSubmit: values => {
      atualizarPassword(values.passNova, props.nif);

      if (insucesso === false) {
        formik.resetForm({
          values: {
            passAtual: "",
            passNova: "",
            confirmacao: ""
          }
        });

        setAlterado(true);
      }
    },
    });

  return (
    <Popup trigger={<button className="btn btn-primary"> Mudar password </button>} modal>
    {close => (
        <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}
        >
        <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Alteração da password</Modal.Title>
            <Button variant='danger' onClick={close}>
              &times;
            </Button>
        </Modal.Header>

        <Modal.Body>
            <p>Preencha os seguintes campos de modo a alterar a sua password.</p>
            <p>Após alterar a sua password terá de efetuar login de novo.</p>

            { alterado ? (<p className='text-success'>Password alterada com sucesso!</p>) : null }
            { erroInterno ? (<p className='text-danger'> Erro interno, por favor tente de novo </p>) : null }

            <Form onSubmit={formik.handleSubmit}>
            <Form.Label htmlFor="passAtual">Password atual: </Form.Label>
                <Form.Control size="sm"
                    id="passAtual"
                    name="passAtual"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.passAtual}
                />
            {formik.touched.passAtual && formik.errors.passAtual ? (
            <small className="form-text text-danger">
              {formik.errors.passAtual}
            </small>
            ) : null}
            <br/>
              
            <Form.Label htmlFor="passNova">Password nova: </Form.Label>
                <Form.Control size="sm"
                    id="passNova"
                    name="passNova"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.passNova}
              />
            {formik.touched.passNova && formik.errors.passNova ? (
            <small className="form-text text-danger">
              {formik.errors.passNova}
            </small>
            ) : null}
              
            <Form.Label htmlFor="confirmacao">Confirme a password: </Form.Label>
              <Form.Control size="sm"
                  id="confirmacao"
                  name="confirmacao"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmacao}
              />
            {formik.touched.confirmacao && formik.errors.confirmacao ? (
            <small className="form-text text-danger">
              {formik.errors.confirmacao}
            </small>
            ) : null}

            </Form>
        </Modal.Body>

        <Modal.Footer>
            <Button onClick={close} variant="danger">Cancelar</Button>
            <Button onClick={formik.handleSubmit} variant="success">Alterar password</Button>
        </Modal.Footer>
        </Modal.Dialog>
    </div>
    )}
</Popup>
  )
}

export default PopupAlterarPass;
