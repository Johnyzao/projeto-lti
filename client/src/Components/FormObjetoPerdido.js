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
import FormCategoria from './FormCategoria';

function FormObjetoPerdido() {
    const [file, setFile] = useState(null);
    const [localizacaoAceite, setLocalizacaoAceite] = useState(false);

    const [pais, setPais] = useState("pt");
    const [distrito, setDistrito] = useState("");

    async function criarLocalizacao(pais,distrito,municipio,freguesia,rua,coords) {
        await axios.put(
            config.LINK_API + "/location" , 
             {pais: pais, distrito: distrito, municipio: municipio, freguesia: freguesia,rua:rua, coords: coords } ,
             { headers: {'Content-Type': 'application/json'}}
         ).then( (res) => {
             if ( res.status === 200 ) {

             } 
     
         }).catch( function (error) {
             if ( error.response ) {
                 let codigo = error.response.status;

             }
         })
    }

    async function criarObjeto(nome, desc) {

    }

    async function criarObjetoPerdido() {

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData();
        for(var x = 0; x<file.length; x++) {
            data.append('file', file[x])
        }
        axios.post(config.LINK_API + "/upload/lostObjectImage", data)
        .then(res => { 
            console.log(res.statusText)
          })
    }

    const handleFileChange = (event) => {
        setFile(event.target.files);
        console.log(file)
    }

    const validate = values => {
        const errors = {};

        values.nome === ""
            ? delete errors.nome
            : errors.nome = "Por favor dê um nome ao objeto perdido.";

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            nome:"",
            desc:"",
            pais:"",
            distrito:"",
            municipio:"",
            freguesia:"",
            rua:"",
            coords:"",
            data: ""
        },
        validate,
        onSubmit: values => {
            let {municipio, freguesia, rua, coords} = values;
            criarLocalizacao(pais, distrito, municipio, freguesia, rua, coords);

        },
    });

    return (
        <>
            <div className='container-sm bg-dark-subtle'>
            <Form onSubmit={formik.handleSubmit}>
            <Row>
                <Col>
                    <h3 className='text-center'> Criação do anúncio de um objeto perdido: </h3>
                    <Form.Label>Nome do anúncio:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="nome"
                        name="nome"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nome}
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Label>Descrição do anúncio: </Form.Label>
                    <Form.Control
                        id="desc"
                        name="nodescme"
                        type="textarea"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.desc}
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Label htmlFor="file">Imagem do objeto perdido:</Form.Label>
                    <Form.Control 
                        className="form-control-file mb-3" 
                        type="file" id="file" 
                        accept=".jpg"
                        multiple
                        onChange={handleFileChange}
                    />
                </Col>
            </Row>

            <br/>
            <Row>
                <h3 className='text-center'> Localização onde foi perdido: </h3>
                <Col>
                    <Form.Label>País:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="pais"
                        name="pais"
                        onChange={(e) => {setPais(e.target.value)}}
                    >
                        <option values="pt">Portugal</option>
                    </Form.Select>
                </Col>

                <Col>
                    <Form.Label>Distrito:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="pais"
                        name="pais"
                        onChange={(e) => {setDistrito(e.target.value)}}
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
                        <option selected values="Lisboa">Lisboa</option>
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
                    <Form.Label>Município: </Form.Label>
                    <Form.Control
                        id="municipio"
                        name="municipio"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.municipio}
                    />
                </Col>

                <Col>
                    <Form.Label>Freguesia: </Form.Label>
                    <Form.Control
                        id="freguesia"
                        name="freguesia"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.freguesia}
                    />
                </Col>
                </Row>
                <Row>
                <Col>
                    <Form.Label>Rua: </Form.Label>
                    <Form.Control
                        id="rua"
                        name="rua"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.rua}
                    />
                </Col>

                <Col>
                    <Form.Label>Coordenadas: </Form.Label>
                    <Form.Control
                        id="coords"
                        name="coords"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.coords}
                    />
                </Col>

                <Col>
                    <Form.Label>Data em que foi encontrado: </Form.Label>
                    <Form.Control
                        id="coords"
                        name="coords"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.coords}
                    />
                </Col>
                </Row>
            <br/>
            <Row>
                <Col>
                    <h3> Categorias do objeto: </h3>
                    <p> Por implementar... </p>
                </Col>
            </Row>

                <br/>
                <Container className='text-center'>
                    <Button type="submit" className='text-center'> Criar anúncio </Button>
                </Container>
            </Form>
            </div>
        </>
    )
}

export default FormObjetoPerdido;
