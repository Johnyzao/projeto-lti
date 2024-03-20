import React, { useState } from 'react';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

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

  async function obterDadosUser(mail) {
    await axios.get(
      "http://localhost:3000/user",
      {mail: mail},
      { validateStatus: function (status) {
        return true;
      }},
      { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        if (res.status === 200) {
            localStorage.setItem( "dados", JSON.stringify( res.data ) );
            navigate("/");
        } else {
            setErroServidor( "Por favor tente de novo, ocorreu um erro." );
        }
    })
  }

  // Função a ser usada no handleSubmit do form.
  async function autenticarUtilizador(mailUser, passUser) {
    let creds = {
      mail: validator.escape(validator.trim( mailUser )) , 
      pass: validator.escape(validator.trim( passUser ))
    };

    await axios.post(
       "http://localhost:3000/login" , 
        creds ,
        { validateStatus: function (status) {
          return true;
        }},
        { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        // Strings de debug
        console.log("Dados recebidos do pedido GET /login:" + res.data );
        console.log(res.statusText);

        if ( res.status === 500 ) {
          setErroCreds("");
          setErroServidor("Por favor tente de novo, ocorreu um erro.");
        } 

        if ( res.status === 401 ) {
          setErroServidor("");
          setErroCreds("Email ou password errados, por favor insira as suas credenciais de novo.");
        }

        if ( res.status === 200 ) {
          setErroCreds("");
          setErroServidor("");

          obterDadosUser(mailUser);

        } 

    });
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
    <div>
    <form onSubmit={formik.handleSubmit}>
      <label htmlFor="mail">Mail</label>
      <input
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

      <label htmlFor="pass">Pass</label>
      <input
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
      <button type="submit">Submit</button>
    </form>
    </div>
  );
}

export default Login;
