import { React, useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useFormik } from 'formik';
import Form from 'react-bootstrap/Form';
import validator from 'validator';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupEditarPolicia(props) {

    const {id, nome, mail, password, posto, removido} = props.policia;
    const [novoPostoPolicia ,setNovoPostoPolicia] = useState(posto);
    const [tokenAuth, setTokenAuth] = useState("");
    const [mailDuplicado, setMailDuplicado] = useState(false);
    const [postosDisponiveisNovoPolicia, setPostosDisponiveisNovoPolicia] = useState([]);
    const [sucessoAtualizarPolicia, setSucessoAtualizarPolicia] = useState(false);

    function obterTokenAuth0(){
        let jsonCreds = {
          "grant_type": "client_credentials",
          "client_id": "265wBrgSH3GDA6dHNZPYlpEiJM7Gl5S2",
          "client_secret": "srJBHxmqhcQGZroywI0aacKwxgSjApdC6K2nXVFxmTnASUN6G-95Jb_Y1jvLYRQi",
          "audience": "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/"
        }
        axios.post(
            "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/oauth/token",
            jsonCreds, 
            { headers: {'Content-Type': 'application/json'}},
            ).then ( (res) => {
              if (res.status === 200) {
                  setTokenAuth( res.data.access_token );
              } 
          })
    }

    async function editarCredsNoAuth0( info ) {
        editarMailPoliciaAuth0(info.mail, info.nome, info.id);
        editarPasswordPoliciaAuth0(info.password, info.id);
    }

    async function editarPasswordPoliciaAuth0(novaPass, idPolicia) {
        let jsonComInfo = {
            "password": novaPass,
            "connection": "Username-Password-Authentication",
        };

        await axios.patch(
                "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth0|" + idPolicia,
                jsonComInfo,
                { headers: { Authorization: `Bearer ${tokenAuth}` } },
            ).then((res) => {
                if (res.status === 200) {
                    console.log("Atualizado");

                    setSucessoAtualizarPolicia( true );
                    setTimeout(() => {
                        setSucessoAtualizarPolicia( false );
                    }, 5000);
                }
        });
    }

    async function editarMailPoliciaAuth0(novoMail, novoNome, idPolicia) {
        let jsonComInfo = {
            "email": novoMail,
            "nickname": novoNome,
            "connection": "Username-Password-Authentication",
        };

        await axios.patch(
                "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users/auth0|" + idPolicia,
                jsonComInfo,
                { headers: { Authorization: `Bearer ${tokenAuth}` } },
            ).then((res) => {
                if (res.status === 200) {
                    console.log("Atualizado");
                }
        });
    }

    async function editarInfoPolicia(info){
        axios.put(
            config.LINK_API + "/police",
            info,
            { headers: {'Content-Type': 'application/json'}},
        ).then( (res) => {
            if ( res.status === 200 ) {
                editarCredsNoAuth0( info );
            }
        })
    }

    function verificarMailDuplicado(novoMail) {
        axios.get(
            config.LINK_API + "/checkMailDuplicate/" + novoMail,
            { headers: {'Content-Type': 'application/json'}},
            { validateStatus: function (status) {
              return true;
            }}
        ).then( (res) => {
            res.status === 200 
                ? setMailDuplicado(false)
                : setMailDuplicado(true);
        }).catch(function (error) {
        if ( error.response ) {
        }});
    }

    async function obterPostos() {
        await axios.get(
            config.LINK_API + "/policeStation",
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                setPostosDisponiveisNovoPolicia(res.data);
            }

        });
    }

    const validate = values => {
        const errors = {};

        values.nomeNovo !== "" 
            ? delete errors.nomeNovo 
            : errors.nomeNovo = "Por favor escreva um nome.";

        validator.isStrongPassword( values.passNova )
            ? delete errors.passNova
            : errors.passNova = "Password fraca, por favor altera-a." 

        /** Verificacoes do Mail **/
        validator.isEmail( values.mailNovo ) && values.mailNovo !== ""
            ? delete errors.mailNovo
            : errors.mailNovo = "Email inválido.";

        verificarMailDuplicado(validator.escape(validator.trim(values.mailNovo)))
        !mailDuplicado 
            ? delete errors.mailNovo 
            : errors.mailNovo = "Mail duplicado, por favor introduza um novo mail";

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            idNovo: id,
            nomeNovo: nome,
            passNova: password,
            mailNovo: mail
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            let info = {id:values.idNovo, nome: values.nomeNovo, password: values.passNova, posto: novoPostoPolicia, mail: values.mailNovo}
            editarInfoPolicia( info );
        },
    });

    function desenharBotao(estado) {
        if ( estado === 1 ) {
            return (<Button className="btn btn-primary" disabled> Editar </Button>);
        } else {
            return (<Button className="btn btn-primary"> Editar </Button>);
        }
    }

    const mostrarPostosDisponiveis = postosDisponiveisNovoPolicia.map( posto => 
        <option key={posto.id} value={posto.id}> {posto.codpostal} {posto.localidade}, {posto.morada} </option>
    );

    useEffect( () => { obterTokenAuth0() }, [] );
    useEffect( () => { obterPostos() }, [] );
    return (
        <Popup trigger={desenharBotao(removido)} modal>
        {close => (
          <div
            className="modal show"
            style={{ display: 'block', position: 'initial' }}
          >
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>Edição de conta de um polícia </Modal.Title>
                <Button variant='danger' onClick={close}>
                  &times;
                </Button>
              </Modal.Header>

              <Modal.Body>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Label>Mail para o login:<span className='text-danger'>*</span> </Form.Label>
                  <Form.Control
                      id="mailNovo"
                      name="mailNovo"
                      type="mail"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.mailNovo}
                  />
                  <Form.Text className="text-muted">
                    Introduza um mail do tipo "algo@exemplo.com".
                  </Form.Text>

                <Form.Label htmlFor="passNova">Password:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="passNova"
                    name="passNova"
                    type="passNova"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.passNova}
                />
                { formik.errors.passNova ? (<p className='text-danger'> {formik.errors.passNova} </p>) : null }

                <Form.Label htmlFor="nomeNovo">Nome:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="nomeNovo"
                    name="nomeNovo"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nomeNovo}
                />
                { formik.errors.nomeNovo ? (<p className='text-danger'> {formik.errors.nomeNovo} </p>) : null } 

                <Form.Label htmlFor="posto">Posto:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Select as="select"
                    size="lg"
                    id="posto"
                    name="posto"
                    onChange={(e) => {console.log(e.target.value); setNovoPostoPolicia(e.target.value);}}
                    defaultValue={posto}
                >
                    {mostrarPostosDisponiveis}
                </Form.Select>
                </Form>
                { sucessoAtualizarPolicia ? (<p className='text-success text-center'>Polícia atualizado com sucesso</p>) : null }

              </Modal.Body>

              <Modal.Footer>
                <Button onClick={close} variant="danger">Cancelar</Button>
                <Button onClick={formik.handleSubmit} variant="success">Confirmar alterações</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}
      </Popup>
    )
}

export default PopupEditarPolicia
