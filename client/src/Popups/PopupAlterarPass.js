import { React, useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useFormik } from 'formik';
import Form from 'react-bootstrap/Form';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

import { useAuth0 } from "@auth0/auth0-react";

function PopupAlterarPass(props) {
    const navigate = useNavigate();
    const { logout } = useAuth0();
    const [tokenAuth, setTokenAuth] = useState("");

    const [erroInternoPass, setErroInternoPass] = useState(false);
    const [mesmaPass, setMesmaPass] = useState(false);
    const [passwordAtualErrada, setPasswordAtualErrada] = useState(false);

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

    async function editarPassAuth0(novaPass, nif){
      let jsonComInfo = {
          "password": novaPass,
          "connection": "Username-Password-Authentication",
      };
      await axios.patch(
              "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth|" + nif,
              jsonComInfo,
              { headers: { Authorization: `Bearer ${tokenAuth}` } },
          ).then((res) => {
              if (res.status === 200) {
                  console.log("Atualizado");
                  logout();
              }
          }).catch( function(error) {
            if (error.response) {
              let codigo = error.response.status;
    
              codigo === 500
                ? setErroInternoPass(true)
                : setErroInternoPass(false);
          }});
  }

    async function atualizarPassword(passNova, passAtual, nif) {
      await axios.put(
        config.LINK_API + "/user/" + nif + "/changePassword",
        { novaPass: passNova, passAtual: passAtual },
        { headers: { 'Content-Type': 'application/json' } },
        {
          validateStatus: function (status) {
            return true;
          }
        }
      ).then((res) => {
        if (res.status === 200) {
          setMesmaPass(false);
          setPasswordAtualErrada(false);
          setErroInternoPass(false);
          editarPassAuth0( passNova, nif );
        }
      }).catch(function (error) {
        if (error.response) {
          let codigo = error.response.status;

          codigo === 500
            ? setErroInternoPass(true)
            : setErroInternoPass(false);

          if (codigo === 406) {
            console.log("aqui");
            setMesmaPass(true);
          }

          if (codigo === 400) {
            setMesmaPass(false);
            setPasswordAtualErrada(true);
          }
        }
      });
    }

    const validate = values => {
      const errors = {};

      values.passNova === ""
        ? errors.passNova = "Por favor insira uma password nova."
        : delete errors.passNova;

      values.passNova === values.passAtual
        ? errors.passNova = "Por favor insira uma password diferente da atual."
        : delete errors.passNova;

      values.passNova !== "" && validator.isStrongPassword(values.passNova)
        ? delete errors.passNova
        : errors.passNova = "Password fraca, por favor introduza uma nova.";

      values.passNova === values.confirmacao
        ? delete errors.confirmacao
        : errors.confirmacao = "Passwords são diferentes, por favor escreva a mesma password."

      passwordAtualErrada
        ? errors.passAtual = "Password errada, por favor insira a sua password atual"
        : delete errors.passAtual;

      console.table(errors);
      console.log(mesmaPass);
      return errors;
    }

    const formik = useFormik({
      initialValues: {
        passAtual: "",
        passNova: "",
        confirmacao: ""
      },
      validate,
      onSubmit: values => {
        atualizarPassword(values.passNova, values.passAtual, props.nif);
      }
    });

    useEffect( () => { obterTokenAuth0() }, [] );
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

                {erroInternoPass ? (<p className='text-danger'> Erro interno, por favor tente de novo. </p>) : null}
                {mesmaPass ? (<p className='text-danger'> A nova palavra passe é igual à antiga, por favor escolha uma nova. </p>) : null}

                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group>
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
                    <br />
                  </Form.Group>

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

                  <Form.Label htmlFor="confirmacao">Confirme a nova password: </Form.Label>
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
