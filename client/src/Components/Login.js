import React from 'react';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

import validator from 'validator';

function Login() {
  const validate = values => {
    const errors = {};

    // @TODO: Verificação para mail ou pass errados!
    // @TODO: Definir como mostrar erros quando há um 401 e um 200
    if ( !validator.isEmail( values.mail ) ) {
      errors.mail = "Insira um mail válido.";
    } else if ( !values.mail ) {
      errors.mail = "Mail requerido para efetuar login."
    }

    if ( values.pass.length < 8) {
      errors.pass = "Insira uma pass válida.";
    } else if ( !values.pass) {
      errors.mail = "Pass requerida para efetuar login."
    }

    return errors;
  }

  // Função a ser usada no handleSubmit do form.
  async function autenticarUtilizador(mailUser, passUser) {
    let creds = {
      mail: validator.escape(validator.trim( mailUser )) , 
      pass: validator.escape(validator.trim( passUser ))
    };

    await axios.post(
       "http://localhost:3000/login" , 
        JSON.stringify(creds) , 
        { headers: {'Content-Type': 'application/json'}}
    ).then( (res) => {
        // Strings de debug
        console.log( "Dados recebidos do pedido GET /login:" + res.data );
        console.log(res.statusText);

        if ( res.status === 500 ) {
            // Demonstrar mensagem de erro.
        } 

        if ( res.status === 401 ) {
          // Informar user que o login foi inválido (401)
        }

        if ( res.status === 200 ) {
          // Redirecionar para o home idk.
        } 

    });
  };

  const formik = useFormik({
    initialValues: {
      mail: '',
      pass: '',
    },
    validate,
    onSubmit: values => {
      autenticarUtilizador(values.mail, values.pass)
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
        type="text"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.pass}
      />
      {formik.touched.pass && formik.errors.pass ? (
        <div>{formik.errors.pass}</div>
      ) : null}

      <button type="submit">Submit</button>
    </form>
    {formik.touched.pass && formik.errors.pass ? (
        <div>{formik.errors.pass}</div>
      ) : null}
    </div>
  );
}

export default Login;
