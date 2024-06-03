import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import axios from 'axios';
import { useFormik } from 'formik';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import config from '../config';

function Login() {
  const navigate = useNavigate();
  let [erroCreds, setErroCreds] = useState(false);
  let [erroServidor, setErroServidor] = useState(false);

  const validate = values => {
    const errors = {};

    validator.isEmail(values.mail) && values.mail !== ""
      ? delete errors.mail
      : errors.mail = "Email inválido.";

    values.pass !== ""
      ? delete errors.pass
      : errors.pass = "Por favor insira uma password.";

    return errors;
  }

  function autenticarUtilizador(mailUser, passUser) {
    let creds = {
      mail: validator.escape(validator.trim(mailUser)),
      pass: validator.escape(validator.trim(passUser))
    };

    axios.post(
      config.LINK_API + "/login",
      creds,
      { validateStatus: function (status) { return true; } },
      { headers: { 'Content-Type': 'application/json' } }
    ).then((res) => {
      if (res.status === 200) {
        const { nome, mail, nif, estado, tipo } = res.data;
        let dadosUser = { nome: nome, mail: mail, nif: nif, estado: estado, tipo: tipo };
        localStorage.setItem("dados", JSON.stringify(dadosUser));
        setErroCreds(false);
        setErroServidor(false);
        navigate("/");
      } else if (res.status === 401) {
        setErroCreds(true);
      }
    }).catch(function (error) {
      if (error.response) {
        setErroServidor(true);
      }
    });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      mail: '',
      pass: '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validate,
    onSubmit: values => {
      autenticarUtilizador(values.mail, values.pass);
    },
  });

  return (
    <Container fluid style={styles.container}>
      <Row className="justify-content-center">
        <Form onSubmit={formik.handleSubmit} style={styles.form}>
          <h3 style={styles.title}>Login</h3>
          <Form.Group controlId="mail">
            <Form.Label style={styles.label}>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Email or Phone"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mail}
              style={styles.input}
            />
            {formik.touched.mail && formik.errors.mail && (
              <div className='text-danger' style={styles.error}>{formik.errors.mail}</div>
            )}
          </Form.Group>
          <Form.Group controlId="pass">
            <Form.Label style={styles.label}>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pass}
              style={styles.input}
            />
            {formik.touched.pass && formik.errors.pass && (
              <div className='text-danger' style={styles.error}>{formik.errors.pass}</div>
            )}
          </Form.Group>
          {erroServidor && (
            <p className='text-danger' style={styles.error}>Por favor tente de novo, ocorreu um erro.</p>
          )}
          {erroCreds && (
            <p className='text-danger' style={styles.error}>Email ou password errados, por favor insira as suas credenciais de novo.</p>
          )}
          <Button type="submit" style={styles.button}>Log In</Button>
        </Form>
      </Row>
    </Container>
  );
}

const styles = {
  container: {
    backgroundColor: '#f3f4f6',
    paddingTop: '50px',
    minHeight: '100vh',
  },
  form: {
    width: '350px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    padding: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    height: '40px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    padding: '0 10px',
    fontSize: '16px',
  },
  error: {
    fontSize: '14px',
    marginBottom: '20px',
  },
  button: {
    width: '100%',
    height: '40px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Login;
