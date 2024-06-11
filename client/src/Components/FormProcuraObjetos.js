import React, {useState, useEffect} from 'react';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

import { useFormik } from 'formik';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

function FormProcuraObjetos() {

    const [metodoProcura, setMetodoProcura] = useState("desc");
    const [objetosEncontrados, setObjetosEncontrados] = useState([]);

    async function procurarPorDesc(desc) {
        await axios.post(
            config.LINK_API + "/lostObject/searchByDescription",
            {descObj: desc},
            { headers: {'Content-Type': 'application/json'}},
        ).then( (res) => {
            if ( res.status === 200 ) {
                console.log(res.data);
                setObjetosEncontrados(res.data.objs);
            }
        }).catch( function(error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    const validate = values => {
        const errors = {};

        return errors;
    }

    const formik = useFormik({
        initialValues: {
            desc: ""
        },
        validateOnChange:false,
        validateOnBlur:false,
        validate,
        onSubmit: values => {   
            procurarPorDesc(values.desc);
        },
    });

    const desenharObjetos = objetosEncontrados.map( obj => {
        return (
            <div key={obj.id} className='w-100 p-3'>
                <ListGroup.Item>  
                    <a className="list-group-item list-group-item-action flex-column align-items-start">
                        <div className=""> {obj.titulo} </div>
                        <p className="mb-1">{obj.descricao}</p>
                        <small className="text-muted"> Registado em {obj.dataregisto} </small>
                    </a>
                </ListGroup.Item>
            </div>
        )
    });

    useEffect( () => { setObjetosEncontrados([]) }, [] );
    return (
        <>
            <Container className='bg-light' fluid="sm">

                <h1>Procura de objetos perdidos</h1>
                <br/>

                <Form onSubmit={formik.handleSubmit}>

                <Form.Label>Método de procura: </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="procura"
                        name="procura"
                        defaultValue={'desc'}
                        onChange={(e) => {setMetodoProcura(e.target.value)}}
                    >
                        <option value='desc'> Descrição </option>
                        <option value='cats'> Categorias </option>
                    </Form.Select>
                <br/>

                { metodoProcura === "desc" ? (
                    <>  
                        <Form.Label htmlFor="desc">Descrição: </Form.Label>
                            <Form.Control                     
                                id="desc"
                                name="desc"
                                type="textarea" 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.desc}
                            />

                        <br/>
                    </>
                ) : (
                    <p>Cats aqui</p>
                ) }

                <div className='text-center'>
                    <button onClick={formik.submitForm} className="btn btn-outline-success my-2 my-sm-0" type="submit">Procurar</button>
                </div>
                </Form>

                <br/>
                { objetosEncontrados.length > 0 ? (<h2> Objetos encontrados </h2>) : null }
                <Container>
                    <ListGroup variant='flush' className="d-flex justify-content-between align-items-start">
                        { desenharObjetos }
                    </ListGroup>
                </Container>

            </Container>
        </>
    )
}

export default FormProcuraObjetos