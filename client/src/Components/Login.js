import React, { useState } from 'react';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

import { useNavigate } from 'react-router-dom';

import useSignIn from 'react-auth-kit/hooks/useSignIn';

import config from '../config';

function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();

  let [erroCreds, setErroCreds] = useState(false);
  let [erroServidor, setErroServidor] = useState(false);

  const validate = values => {
    const errors = {};

    validator.isEmail( values.mail ) && values.mail !== ""
      ? delete errors.mail
      : errors.mail = "Email inválido.";

    /** Verificacoes da Pass **/
    values.pass !== ""
      ? delete errors.pass
      : errors.pass = "Por favor insira uma password.";

    console.table(errors);
    return errors;
  }

/** 
  async function obterDadosUser(nif) {
    await axios.get(
      "http://localhost:3000/user",
      {nif: nif},
      { validateStatus: function (status) {
        return true;
      }},
      { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        try{
          if (res.status === 200) {
            localStorage.setItem( "dados", JSON.stringify( res.data ) );
            navigate("/");
          } 
        } catch (error) {
          setErroServidor( "Por favor tente de novo, ocorreu um erro." );
        }
    })
  }
**/

  // Função a ser usada no handleSubmit do form.
  function autenticarUtilizador(mailUser, passUser) {
    let creds = {
      mail: validator.escape(validator.trim( mailUser )) , 
      pass: validator.escape(validator.trim( passUser ))
    };

    axios.post(
      config.LINK_API + "/login" , 
        creds ,
        { validateStatus: function (status) {
          return true;
        }},
        { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        // Strings de debug
        console.log("Dados recebidos do pedido GET /login:" + res.data );
        console.log(res.statusText);

        if ( res.status === 200 ) {

          signIn({
            auth: {
              token: '<jwt token>',
              type: 'Bearer'
            },
            userState: { nif: res.data.token.nif, nome: res.data.token.nome },
          })

          setErroCreds("");
          setErroServidor("");
          navigate("/home");
        } 

        res.status === 401
          ? setErroCreds(true)
          : setErroCreds(false); 

    })
    .catch(function (error) {
      if ( error.response ) {
        let codigo = error.response.status;
        codigo === 500 
          ? setErroServidor(true)
          : setErroServidor(false);
    }});
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      mail: '',
      pass: '',
    },
    validateOnChange:false,
    validateOnBlur:false,
    validate,
    onSubmit: values => {
      autenticarUtilizador(values.mail, values.pass);
    },
  });

  return (
    <Container fluid="sm">
    <Row>
    </Row>
    <Row sm={2} >
    <Form onSubmit={formik.handleSubmit} className="text-center">
      <Form.Group className="mb-3">
      <Form.Label htmlFor="mail">Mail</Form.Label>
      <Form.Control
          id="mail"
          name="mail"
          type="mail"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mail}
      />
      {formik.touched.mail && formik.errors.mail ? (
        <div className='text-danger'>{formik.errors.mail}</div>
      ) : null}

      <br></br>

      <Form.Label htmlFor="pass">Pass</Form.Label>
      <Form.Control
        id="pass"
        name="pass"
        type="password"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.pass}
      />
      {formik.touched.pass && formik.errors.pass ? (
        <div className='text-danger'>{formik.errors.pass}</div>
      ) : null}

      <br/>
    </Form.Group>

    { erroServidor 
        ? (<p className='text-danger'>Por favor tente de novo, ocorreu um erro.</p>) 
        : null }

      { erroCreds 
        ? (<p className='text-danger'>Email ou password errados, por favor insira as suas credenciais de novo.</p>) 
        : null 
      }

    <Button type="submit">Submit</Button>
    </Form>
    </Row>
    </Container>
  );
}

export default Login;
