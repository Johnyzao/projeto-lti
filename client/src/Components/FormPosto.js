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

import TabelaPostos from './TabelaPostos';

function FormPosto() {

    const [postoCriado, setPostoCriado] = useState(false); 
    const [postoExistente, setPostoExistente] = useState(false); 
    const [erroInternoPosto, setErroInternoPosto] = useState(false);
    const [atualizarTabelaPosto, setAtualizarTabelaPosto] = useState(false);
    const [localidade, setLocalidade] = useState("Lisboa");

    async function criarPostoPolicia(info) {
        await axios.post(
            config.LINK_API + "/policeStation",
            info,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

            if ( res.status === 201 ) {
                setPostoCriado(true);
                setTimeout(() => {
                    setPostoCriado( false );
                }, 3000);

                setAtualizarTabelaPosto(true);
                setAtualizarTabelaPosto( false );

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

        validator.isMobilePhone( values.telefone, "pt-PT" )
            ? errors.telefone = "Número de telemóvel incorreto."
            : delete errors.telefone;

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            codp: "",
            morada: "",
            telefone:""
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {
            let valoresPosto = {codp: values.codp, morada: values.morada, localidade: localidade, telefone: values.telefone};
            criarPostoPolicia(valoresPosto);
        },
    });


    return (
        <>
            <Form onSubmit={formik.handleSubmit} >
                <h3 className='text-center'> Criar posto de polícia </h3>
                <Row>
                <Col>
                    <Form.Label htmlFor="nome">Código postal do Posto:<span className='text-danger'>*</span>  </Form.Label>
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
                    <Form.Label htmlFor="morada">Morada do Posto:<span className='text-danger'>*</span>  </Form.Label>
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

                <Row>
                <Col>
                    <Form.Label>Localidade: </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="localidade"
                        name="localidade"
                        onChange={(e) => {setLocalidade(e.target.value)}}
                    >
                        <option values="Aveiro">Aveiro</option>
                        <option values="Beja">Beja</option>
                        <option values="Braga">Braga</option>
                        <option values="Bracanca">Bragança</option>
                        <option values="Castelo Branco">Castelo Branco</option>
                        <option values="Coimbra">Coimbra</option>
                        <option values="Evora">Évora</option>
                        <option values="Faro">Faro</option>
                        <option values="Guarda">Guarda</option>
                        <option values="Leiria">Leiria</option>
                        <option values="Lisboa">Lisboa</option>
                        <option values="Portalegre">Portalegre</option>
                        <option values="Porto">Porto</option>
                        <option values="Santarem">Santarém</option>
                        <option values="Setubal">Setúbal</option>
                        <option values="Viana do Castelo">Viana do Castelo</option>
                        <option values="Vila Real">Vila Real</option>
                        <option values="Viseu">Viseu</option>
                    </Form.Select>
                </Col>

                <Col>
                    <Form.Label htmlFor="telefone">Telefone:<span className='text-danger'>*</span>  </Form.Label>
                        <Form.Control
                            id="telefone"
                            name="telefone"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.telefone}
                        />    

                        { formik.errors.telefone ? (<p className='text-danger'> {formik.errors.telefone} </p>) : null }                    
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
            <br/>
            <br/>
            <TabelaPostos/>
        </>
  )
}

export default FormPosto;
