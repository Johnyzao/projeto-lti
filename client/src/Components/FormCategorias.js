import React, {useState, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useFormik } from 'formik';

function FormCategorias() {

    const [numeroAtr, setNumeroAtr] = useState(1);

    const validate = values => {
        const errors = {};

        for( let i=1; i < Object.keys(values).length / 3; i++ ) {

            if ( values["atr"+i] !== "" ) {
                setNumeroAtr( numeroAtr+1 );
            }

            i+=1;
        }

        return errors;
    }

    const formik = useFormik({
        initialValues: {
            nomeCat: "",
            atr1: "",
            type1: ""
        },
        validate,
        onSubmit: values => {
            
        },
    });

    function desenharFormAtributos() {
        let atr = "atr"+numeroAtr;
        let type = "type"+numeroAtr;

        formik.initialValues[atr] = "";
        formik.initialValues[type]= "";

        return ( <>
            <Form.Label htmlFor={atr}>Nome do atributo #{numeroAtr}:<span className='text-danger'>*</span>  </Form.Label>
            <Form.Control
                        id={atr}
                        name={atr}
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[atr]}
                    />
            <br/>

            <Form.Label htmlFor={type}>Tipo de dados do atributo #{numeroAtr}:<span className='text-danger'>*</span>  </Form.Label>
            <Form.Control
                        as="select"
                        id={type}
                        name={type}
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[type]}
            >
                <option value="number"> Numérico </option>
                <option value="text"> Texto </option>
                <option value="alphanumeric"> Alfanumérico </option>
            </Form.Control>
            <br/>
        </>
        )
    }

    return (
        <>
            <Form onSubmit={formik.handleSubmit}>
            <h3 className='text-center'> Criar uma categoria nova </h3>
            <Form.Label htmlFor="nomeCat">Nome da categoria:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="nomeCat"
                        name="nomeCat"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nomeCat}
                    />
            <br/>

            <Form.Label htmlFor="atr1">Nome do atributo #1:<span className='text-danger'>*</span>  </Form.Label>
            <Form.Control
                        id="atr1"
                        name="atr1"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.atr1}
                    />
            <br/>

            <Form.Label htmlFor="type1">Tipo de dados do atributo #1:<span className='text-danger'>*</span>  </Form.Label>
            <Form.Control
                        as="select"
                        id="type1"
                        name="type1"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.type1}
            >
                <option value="number"> Numérico </option>
                <option value="text"> Texto </option>
                <option value="alphanumeric"> Alfanumérico </option>
            </Form.Control>
            <br/>

            { useEffect( () => { desenharFormAtributos() }, [] )}

            </Form>

            <br/>
            <Container className='text-center'>
                <Button type="submit"> Criar categoria </Button>
            </Container>
        </>
    )
}

export default FormCategorias;
