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

  let [erroCreds, setErroCreds] = useState("");
  let [erroServidor, setErroServidor] = useState("");

  const validate = values => {
    const errors = {};

    if ( !validator.isEmail( values.mail ) ) {
      errors.mail = "Insira um mail válido.";
    } else if ( !values.mail ) {
      errors.mail = "Mail requerido para efetuar login."
    }

    if ( values.pass.length < 8) {
      errors.pass = "Insira uma pass válida.";
    } else if ( !values.pass) {
      errors.pass = "Pass requerida para efetuar login."
    }

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
      config.LINK_API + "localhost:3000/login" , 
        creds ,
        { validateStatus: function (status) {
          return true;
        }},
        { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        // Strings de debug
        console.log("Dados recebidos do pedido GET /login:" + res.data );
        console.log(res.statusText);

        signIn({
          auth: {
            token: '<jwt token>',
            type: 'Bearer'
          },
          userState: { nif: res.data.token.nif },
          refresh: <refresh jwt token/>
        })

        if ( res.status === 200 ) {
          setErroCreds("");
          setErroServidor("");
          navigate("/");
        } 

    }).catch(function (error) {
      if ( error.response ) {
        let codigo = error.response.status;

        codigo === 409 
          ? setErroServidor("")
          : setErroCreds("Email ou password errados, por favor insira as suas credenciais de novo."); 

        codigo === 500 
          ? setErroCreds("")
          : setErroServidor("Por favor tente de novo, ocorreu um erro.");
    }});
  };

  const formik = useFormik({
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
    <Form noValidate onSubmit={formik.handleSubmit} className="text-center">
      <Form.Group className="mb-3">
      <Form.Label htmlFor="mail">Mail</Form.Label>
      <Form.Control
          id="mail"
          name="mail"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mail}
      />
      {formik.touched.mail && formik.errors.mail ? (
        <div>{formik.errors.mail}</div>
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
        <div>{formik.errors.pass}</div>
      ) : null}

      {erroServidor !== "" ? (
        <div>{erroServidor}</div>
      ) : null}

      {erroCreds !== "" ? (
        <div>{erroCreds}</div>
      ) : null}

      <br/>
    </Form.Group>
    <Button type="submit">Submit</Button>
    </Form>
    </Row>
    </Container>
  );
}

export default Login;
