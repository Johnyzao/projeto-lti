import React, { useState } from 'react';

// Informacoes da API.
import config from '../config';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import Table from 'react-bootstrap/Table';

import TabelaCategorias from './TabelaCategorias';

function FormCategoria() {
    const [categorias, setCategorias] = useState([]);

    const validate = values => {
        const errors = {};

        values.nomecat === "" 
            ? errors.nomecat = "Por favor escreva um nome para a categoria."
            : delete errors.nomecat;

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            nomecat: "",
            atr: "",
            vlr: ""
        },
        validate,
        onSubmit: values => {
            let objetoCategoria = {
                nomecat: values.nomecat,
                atributo: values.atr,
                valor: values.vlr
            }
            setCategorias( categorias.push(objetoCategoria) );
        },
    });

    const categoriasEscritas = categorias.map( (categoria) => {
        <TabelaCategorias nomecat={categoria.nomecat} atr={categoria.atr} vlr={categoria.vlr} />
    });

    return (
        <>
            <div>
                <Form onSubmit={formik.handleSubmit}>
                <Row>

                <Col>
                <Form.Label>Nome da categoria:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="nomecat"
                        name="nomecat"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nomecat}
                    />
                </Col>

                <Col>
                <Form.Label>Atributo: </Form.Label>
                    <Form.Control
                        id="atr"
                        name="atr"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.atr}
                    />
                </Col>

                <Col>
                <Form.Label>Valor: </Form.Label>
                    <Form.Control
                        id="vlr"
                        name="vlr"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.vlr}
                    />
                </Col>
                </Row>
                    <br/>
                    <br/>
                    <Container className='text-center'>
                        <Button type="submit"> Registar categoria </Button>
                    </Container>
                </Form>

                <br/>
                <br/>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Nome da Categoria</th>
                            <th>Atributo</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoriasEscritas}
                    </tbody>
                </Table>
            </div>
        </>
    )
}

export default FormCategoria;
