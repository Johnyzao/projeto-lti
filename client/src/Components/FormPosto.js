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

function FormPosto() {

    const [postoCriado, setPostoCriado] = useState(false); 
    const [postoExistente, setPostoExistente] = useState(false); 
    const [erroInternoPosto, setErroInternoPosto] = useState(false); 

    async function criarPostoPolicia(info) {
        await axios.post(
            config.LINK_API + "/policeStation",
            info,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

            if ( res.status === 201 ) {
                setPostoCriado(true);
                setPostoExistente(false);
                setErroInternoPosto(false);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 409 ) {
                    setPostoCriado(false);
                    setPostoExistente(true);
                    setErroInternoPosto(false);
                }

                if ( codigo === 500 ) {
                    setPostoCriado(false);
                    setPostoExistente(false);
                    setErroInternoPosto(true);
                }
            }
        });
    }

    const validate = values => {
        const errors = {};

        values.codp !== "" 
            ? delete errors.codp 
            : errors.codp = "Por favor escreva um código postal.";

        validator.isPostalCode(values.codp, "PT")
            ? delete errors.codp 
            : errors.codp = "Por favor escreva um código postal válido.";

        values.morada !== "" 
            ? delete errors.morada 
            : errors.morada = "Por favor escreva uma morada.";

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            codp: "",
            morada: "",
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            criarPostoPolicia(values);
        },
    });


    return (
        <>
            <div className='container-sm bg-dark-subtle'>
                <Form onSubmit={formik.handleSubmit} >
                    <h3 className='text-center'> Criar posto de polícia </h3>
                    <Row>
                    <Col>
                        <Form.Label htmlFor="nome">Código postal do Posto: </Form.Label>
                        <Form.Control
                            id="codp"
                            name="codp"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.codp}
                        />
                        <Form.Text className="text-muted">
                            Um código postal tem o formato: XXXX-XXX.
                        </Form.Text>
                        { formik.errors.codp ? (<p className='text-danger'> {formik.errors.codp} </p>) : null }
                    </Col>   

                    <Col>
                        <Form.Label htmlFor="morada">Morada do Posto: </Form.Label>
                        <Form.Control
                            id="morada"
                            name="morada"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.morada}
                        />    

                        { formik.errors.morada ? (<p className='text-danger'> {formik.errors.morada} </p>) : null }
                    </Col>
                    </Row>

                    <br/>

                    { postoCriado ? (<p className='text-success text-center'> Posto criado com sucesso. </p>) : null }
                    { erroInternoPosto ? (<p className='text-danger text-center'> Erro interno, por favor tente de novo. </p>) : null }
                    { postoExistente ? (<p className='text-warningtext-center '> Este posto já existe no sistema. </p>) : null }

                    <br/>

                    <Container className='text-center'>
                        <Button type="submit" onClick={formik.handleSubmit}> Criar </Button>
                    </Container>
                </Form>
            </div>
        </>
  )
}

export default FormPosto;
