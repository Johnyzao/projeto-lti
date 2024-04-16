import React, { useState} from 'react';

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


function FormPolicia() {

    const [sucessoPolicia, setSucessoPolicia] = useState(false);
    const [existencia, setExistencia] = useState(true);
    const [erroInternoAdicionarPolicia, setErroInternoAdicionarPolicia] = useState(false);

    async function criarContaPolicia(info) {
        await axios.post(
            config.LINK_API + "/police",
            { headers: {'Content-Type': 'application/json'}},
            info,
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                setSucessoPolicia(true);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 409 ) {
                    setExistencia(true);
                    setErroInternoAdicionarPolicia(false);
                }

                if ( codigo === 500 ) {
                    setErroInternoAdicionarPolicia(true);
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

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            id: "",
            nome: "",
            posto: "",
            pass: ""
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            criarContaPolicia(values);
        },
    });

    // TODO: Registar um polícia.
    return (
    <>
        <div className='container-sm bg-dark-subtle'>
            <Form onSubmit={formik.handleSubmit}>
                <h3 className='text-center'> Criar conta de agente da polícia </h3>
                <Row>
                <Col>
                    <Form.Label htmlFor="id">Id: </Form.Label>
                    <Form.Control
                        id="id"
                        name="id"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.id}
                    />
                    <Form.Text className="text-muted">
                        Utilize apenas números para o id.
                    </Form.Text>
                    { formik.errors.id ? (<p className='text-danger'> {formik.errors.id} </p>) : null }
                </Col>

                <Col>
                    <Form.Label htmlFor="pass">Password: </Form.Label>
                    <Form.Control
                        id="pass"
                        name="pass"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.pass}
                    />

                    { formik.errors.pass ? (<p className='text-danger'> {formik.errors.pass} </p>) : null }
                </Col>
                </Row>

                <Row>
                <Col>
                    <Form.Label htmlFor="nome">Nome: </Form.Label>
                    <Form.Control
                        id="nome"
                        name="nome"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nome}
                    />

                    { formik.errors.nome ? (<p className='text-danger'> {formik.errors.nome} </p>) : null } 
                </Col>
                <Col>
                    <Form.Label htmlFor="posto">Posto: </Form.Label>
                    <Form.Control
                        id="posto"
                        name="posto"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.posto}
                    />

                    { }
                </Col>
                </Row>
                
                <br/>

                { erroInternoAdicionarPolicia ? (<p>Erro interno, por favor tente de novo.</p>) : null }
                { sucessoPolicia ? (<p>Conta de polícia criada com sucesso.</p>) : null }
                { existencia ? (<p>Conta com esse id já existe.</p>) : null }

                <Container className='text-center'>
                    <Button type="submit" onClick={formik.handleSubmit}> Criar </Button>
                </Container>
            </Form>
        </div>
    </>
    )
}

export default FormPolicia;
