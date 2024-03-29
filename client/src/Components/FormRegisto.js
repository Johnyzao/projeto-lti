import React, { useState } from 'react';

// Informacoes da API.
import config from '../config';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PasswordStrengthBar from 'react-password-strength-bar';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';

function FormRegisto() {
  const navigate = useNavigate();

  const [mailDuplicado, setMailDuplicado] = useState(false);
  const [erroInterno, setErroInterno] = useState(false);
  const [erroUserDuplicado, setErroUserDuplciado] = useState(false);
  const [genero, setGenero] = useState("Masculino");

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

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
        let codigo = error.response.status;

        codigo === 401
          ? setMailDuplicado(true) 
          : setMailDuplicado(false); 

        codigo === 500 
          ? setErroInterno(true) 
          : setErroInterno(false); 
    }
    })
  }

  function registarUser(novoUtilizador) {
    axios.post(
      config.LINK_API + "/register", 
      novoUtilizador, 
      { headers: {'Content-Type': 'application/json'}},
      { validateStatus: function (status) {
        return true;
      }}
    ).then ( (res) => {
        if (res.status === 200) {
          console.log("aqui")
          setErroInterno(false)
          setErroUserDuplciado(false);
          navigate("/register/success");
        } 
    }).catch(function (error) {
      if ( error.response ) {
          let codigo = error.response.status;
  
          codigo === 409 
            ? setErroUserDuplciado(true) 
            : setErroUserDuplciado(false); 
  
          codigo === 500 
            ? setErroInterno(true) 
            : setErroInterno(false); 
      }
      })
  }

  const validate = values => {
    const errors = {};

    /** Verificacoes do Nome **/
    validator.isAlpha( values.nome ) && values.nome !== "" 
      ? delete errors.nome 
      : errors.nome = "Nome inválido, por favor altere-o.";

    /** Verificacoes do Mail **/
    validator.isEmail( values.mail ) && values.mail !== ""
      ? delete errors.mail
      : errors.mail = "Email inválido.";

    verificarMailDuplicado(validator.escape(validator.trim(values.mail)))
    !mailDuplicado 
      ? delete errors.mail 
      : errors.mail = "Mail duplicado, por favor introduza um novo mail";
    
    /** Verificacoes do NIF **/  
    validator.isVAT( values.nif, 'PT' ) && values.nif !== "" 
      ? delete errors.nif
      : errors.nif = "NIF inválido.";

    /** Verificacoes da Pass **/
    validator.isStrongPassword( values.pass ) && values.pass !== ""
      ? delete errors.pass
      : errors.pass = "Palavra passe fraca, por favor altere-a.";

    /** Verificacoes do Telemovel **/
    validator.isMobilePhone( values.telemovel ) || values.telemovel === "" 
      ? delete errors.telemovel
      : errors.telemovel = "Número de telemóvel inválido.";
    
    ( (validator.isNumeric( values.nic ) 
    && (values.nic.length === 8) ) || values.nic === "") 
      ? delete errors.nic
      : errors.nic = "NIC inválido.";

    new Date("1904-01-01").getTime() < new Date(values.dnasc).getTime() && new Date(values.dnasc).getTime() <= new Date("2006-01-01").getTime()
      ? delete errors.dnasc
      : errors.dnasc = "Data inválida ou tem de ter mais de 18 anos.";

    console.table(errors);
    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
        nome: "",
        nif: "",
        dnasc: "",
        mail: "",
        nic: "", 
        telemovel: "", 
        gen: "Masculino", 
        morada: "",
        pass: ""
    },
    validate,
    onSubmit: values => {
      let novoUser = {};
      novoUser.nome = validator.escape(validator.trim(values.nome));
      novoUser.nif = validator.escape(validator.trim(values.nif));
      novoUser.dnasc = values.dnasc;
      novoUser.mail = validator.escape(validator.trim(values.mail));
      novoUser.nic = validator.escape(validator.trim(values.nic)); 
      novoUser.telemovel = validator.escape(validator.trim(values.telemovel)); 
      novoUser.morada = validator.escape(validator.trim(values.morada));
      novoUser.pass = validator.escape(validator.trim(values.pass));
      novoUser.gen = genero;

      if (!mailDuplicado){
            registarUser(novoUser);
      }
    },
    });

  return (
    <div>
        <Container content='justify-center' fluid="sm" sm="3">
        <h1 className="text-center">Registo</h1>
        <p>Informações que são obrigatórias estão assinaladas com um asterísco vermelho (<span className='text-danger'>*</span>).</p>
          <Form name='registo' noValidate onSubmit={formik.handleSubmit} className="text-center" >
          <Row>
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Nome de utilizador:<span className='text-danger'>*</span>  </Form.Label>
                <Form.Control
                    id="nome"
                    name="nome"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isValid={formik.touched.nome && !formik.errors.nome}
                    isInvalid={formik.errors.nome}
                    value={formik.values.nome}
                />
                <Form.Text className="text-muted">
                  Utilize apenas letras no seu nome (a-z) e (A-Z).
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.nome}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>

            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Mail:<span className='text-danger'>*</span> </Form.Label>
                <Form.Control
                    id="mail"
                    name="mail"
                    type="mail"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.mail}
                    isValid={formik.touched.mail && !formik.errors.mail}
                    isInvalid={formik.errors.mail}
                />
                <Form.Text className="text-muted">
                  Introduza um mail do tipo "algo@exemplo.com".
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.mail}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>NIF:<span className='text-danger'>*</span> </Form.Label>
                <Form.Control
                    id="nif"
                    name="nif"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nif}
                    isValid={formik.touched.nif && !formik.errors.nif}
                    isInvalid={formik.errors.nif}
                />
                <Form.Text className="text-muted">
                  Apenas são aceites NIF's portugueses.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.nif}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
            
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Password:<span className='text-danger'>*</span> </Form.Label>
                <Form.Control
                    id="pass"
                    name="pass"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pass}
                    isValid={formik.touched.pass && !formik.errors.pass}
                    isInvalid={formik.errors.pass}
                />
                <PasswordStrengthBar password={formik.values.pass}/>
                <Form.Text className="text-muted">
                A Pass deve ter 8 dígitos e : 1 letra maiúscula, 
                                                     1 número,
                                                     1 caracter especial (!,.*).
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.pass}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>NIC:</Form.Label>
                <Form.Control
                    id="nic"
                    name="nic"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.nic}
                    isValid={formik.touched.nic && !formik.errors.nic}
                    isInvalid={formik.errors.nic}
                />
                <Form.Text className="text-muted">
                  Apenas são aceites NIC's portugueses.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.nic}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
            
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Número de telemóvel:</Form.Label>
                <Form.Control
                    id="telemovel"
                    name="telemovel"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.telemovel}
                    isValid={formik.touched.telemovel && !formik.errors.telemovel}
                    isInvalid={formik.errors.telemovel}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.telemovel}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Data de Nascimento:<span className='text-danger'>*</span></Form.Label>
                <Form.Control
                    id="dnasc"
                    name="dnasc"
                    type="date"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dnasc}
                    isValid={formik.touched.dnasc && !formik.errors.dnasc}
                    isInvalid={formik.errors.dnasc}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.dnasc}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
            
            <Col>
            <Form.Group className="mb-3">
                <Form.Label>Morada:</Form.Label>
                <Form.Control
                    id="morada"
                    name="morada"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.morada}
                    isValid={formik.touched.morada && !formik.errors.morada}
                    isInvalid={formik.errors.morada}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.morada}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
            
            <Col>
            <Form.Group className="mb-2">
                <Form.Label>Género:</Form.Label>
                <Form.Select as="select"
                    size="lg"
                    id="genero"
                    name="genero"
                    onChange={(e) => {setGenero(e.target.value)}}
                >
                  <option values="Masculino">Masculino</option>
                  <option values="Feminino">Feminino</option>
                  <option values="Outro">Outro</option>
                  <option values="Prefiro não indicar">Prefiro não indicar</option>
                </Form.Select>
            </Form.Group>
            </Col>
          </Row>
          { erroUserDuplicado ? (<p>Erro, este utilizador já se encontra registado.</p>) : null }
          { erroInterno ? (<p className='text-danger'> Erro interno, por favor tente novamente. </p>) : null }
          <Button type="submit" onClick={forceUpdate}>Registar</Button>
          </Form>
        </Container>
    </div>
  )
}

export default FormRegisto;
