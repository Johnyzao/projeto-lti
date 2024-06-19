import React, {useState, useEffect} from 'react';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { useFormik } from 'formik';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import validator from 'validator';

import TabelaPolicias from './TabelaPolicias';

function FormPolicia() {

    const [erroJaExiste, setErroJaExiste] = useState(false);
    const [novoPoliciaCriado, setNovoPoliciaCriado] = useState(false);
    const [erroInternoAdicionarPolicia, setErroInternoAdicionarPolicia] = useState(false);
    const [postosDisponiveis, setPostosDisponiveis] = useState([]);
    const [atualizarTabelaPolicias, setAtualizarTabelaPolicias] = useState(false);
    const [postoPolicia ,setPostoPolicia] = useState("1");
    const [mailDuplicado, setMailDuplicado] = useState(false);
    const [tokenAuth, setTokenAuth] = useState("");

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
  
    async function registarPoliciaNoAuth0(info) {
  
        let jsonComInfo = {
            "email": info.mail,
            "user_metadata": { "admin": "false" },
            "blocked": false,
            "email_verified": false,
            "app_metadata": {},
            "nickname": info.nome,
            "user_id": info.id,
            "connection": "Username-Password-Authentication",
            "password": info.pass,
            "verify_email": false
          };
  
          await axios.post(
              "https://dev-bsdo6ujjdkx3ra55.eu.auth0.com/api/v2/users",
              jsonComInfo,
              { headers: {Authorization: `Bearer ${tokenAuth}`}},
          ).then( (res) => {
            if ( res.status === 201 ) {
                criarContaPolicia(info);
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
                setPostosDisponiveis(res.data);
                setAtualizarTabelaPolicias(true);
                setAtualizarTabelaPolicias( false );
            }

        });
    }

    async function criarContaPolicia(info) {
        await axios.post(
            config.LINK_API + "/police",
            info,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

            if ( res.status === 201 ) {
                setNovoPoliciaCriado(true);
                setTimeout(() => {
                    setNovoPoliciaCriado( false );
                }, 5000);

                setAtualizarTabelaPolicias(true);
                setAtualizarTabelaPolicias( false );
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 401 ) {
                    setErroJaExiste(true);
                    setTimeout(() => {
                        setErroJaExiste( false );
                    }, 5000);
                }

                if ( codigo === 500 ) {
                    setErroInternoAdicionarPolicia(true);
                    setTimeout(() => {
                        setErroInternoAdicionarPolicia( false );
                      }, 5000);
                }
            }
        });
    }

    const validate = values => {
        const errors = {};

        values.id !== "" 
            ? delete errors.id 
            : errors.id = "Por favor, escreva um id.";

        validator.isNumeric( values.id )
            ? delete errors.id 
            : errors.id = "Por favor, escreva um id válido.";

        values.nome !== "" 
            ? delete errors.nome 
            : errors.nome = "Por favor escreva um nome.";

        validator.isStrongPassword( values.pass )
            ? delete errors.pass
            : errors.pass = "Password fraca, por favor altera-a." 

        /** Verificacoes do Mail **/
        validator.isEmail( values.mail ) && values.mail !== ""
            ? delete errors.mail
            : errors.mail = "Email inválido.";

        verificarMailDuplicado(validator.escape(validator.trim(values.mail)))
        !mailDuplicado 
            ? delete errors.mail 
            : errors.mail = "Mail duplicado, por favor introduza um novo mail";

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            id: "",
            nome: "",
            pass: "",
            mail: ""
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            let info = {id:values.id, nome: values.nome, pass: values.pass, posto: postoPolicia, mail: values.mail}
            registarPoliciaNoAuth0(info);
            //criarContaPolicia(info);
            // Auth0 aqui.
        },
    });

    const mostrarPostosDisponiveis = postosDisponiveis.map( posto => 
        <option key={posto.id} value={posto.id}> {posto.codpostal} {posto.localidade}, {posto.morada} </option>
    );

    useEffect( () => { obterPostos() }, [] );
    useEffect( () => { obterTokenAuth0() }, [] );
    return (
    <>
        <div className='container-sm bg-dark-subtle'>
            <Form onSubmit={formik.handleSubmit}>
                <h3 className='text-center'> Criar conta de agente da polícia </h3>
                <p> Se não houver postos no sistema, não será possível criar contas para agentes. </p>

                <Form.Label htmlFor="id">Id:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="id"
                    name="id"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.id}
                    disabled={ postosDisponiveis.length === 0 }
                />
                <Form.Text className="text-muted">
                    Utilize apenas números para o id.
                </Form.Text>
                { formik.errors.id ? (<p className='text-danger'> {formik.errors.id} </p>) : null }
                <br/>

                <Form.Label>Mail para o login:<span className='text-danger'>*</span> </Form.Label>
                  <Form.Control
                      id="mail"
                      name="mail"
                      type="mail"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.mail}
                  />
                  <Form.Text className="text-muted">
                    Introduza um mail do tipo "algo@exemplo.com".
                  </Form.Text>
                <br/>

                <Form.Label htmlFor="pass">Password:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="pass"
                    name="pass"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pass}
                    disabled={ postosDisponiveis.length === 0 }
                />
                { formik.errors.pass ? (<p className='text-danger'> {formik.errors.pass} </p>) : null }
                <br/>

                <Form.Label htmlFor="nome">Nome:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="nome"
                    name="nome"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nome}
                    disabled={ postosDisponiveis.length === 0 }
                />
                { formik.errors.nome ? (<p className='text-danger'> {formik.errors.nome} </p>) : null } 
                <br/>

                <Form.Label htmlFor="posto">Posto:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Select as="select"
                        size="lg"
                        id="posto"
                        name="posto"
                        onChange={(e) => {console.log(e.target.value); setPostoPolicia(e.target.value);}}
                        disabled={ postosDisponiveis.length === 0 }
                >
                    {mostrarPostosDisponiveis}
                </Form.Select>
                <br/>

                { erroInternoAdicionarPolicia ? (<p className='text-center text-danger'>Erro interno, por favor tente de novo.</p>) : null }
                { novoPoliciaCriado ? (<p className='text-center text-success' >Conta de polícia criada com sucesso.</p>) : null }
                { erroJaExiste ? (<p className='text-center text-danger' >Conta com esse id já existe.</p>) : null }

                <br/>
                <Container className='text-center'>
                    <Button type="submit" disabled={ postosDisponiveis.length === 0 } onClick={formik.handleSubmit}> Criar </Button>
                </Container>
            </Form>
            <br/>
            <br/>
            <TabelaPolicias atualizar={atualizarTabelaPolicias}/>
        </div>
    </>
    )
}

export default FormPolicia;
