import React, {useState} from 'react';
import { Formik, Field, FieldArray } from 'formik';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

function FormCategorias() {

    const [erroRegistarCategoria, setErroRegistarCategoria] = useState(false);
    const [erroInternoCategoria, setErroInternoCategoria] = useState(false);

    const [categoriaCriadaComSucesso, setCategoriaCriadaComSucesso] = useState(false);

    const validate = values => {
        const errors = {};

        values.categoria !== "" 
            ? delete errors.categoria
            : errors.categoria = "Por favor, escreva um nome para a categoria.";
        
        let camposValidos = true;
        values.campos.map( campo => {
            campo === ""
                ? camposValidos = false
                : camposValidos = true;
        });

        camposValidos === false 
            ? errors.campos = "Por favor preencha todos os campos ou apague os campos sem nome." 
            : delete errors.campos;

        console.table(errors);
        return errors;
    }


    function removerCampo(arrayHelpers, index, values) {
        arrayHelpers.remove(index)
    }

    async function registarCampoDaCategoria( campo ){
        await axios.post(
            config.LINK_API + "/field",
            campo,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

            if ( res.status === 201 ) {

            } 

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
                if ( codigo === 500 ) {
                    setErroInternoCategoria(true);
                    setTimeout(() => {
                        setErroInternoCategoria(true);
                    }, 5000);
                }
            }
        });
    }

    async function registarCategoriaNova( infoCategoria ){
        await axios.post(
            config.LINK_API + "/categoryName",
            infoCategoria,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

            if ( res.status === 201 ) {
                setCategoriaCriadaComSucesso(true);
                setTimeout(() => {
                    setCategoriaCriadaComSucesso(false);
                }, 5000);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
                    setErroRegistarCategoria(true);
                    setTimeout(() => {
                        setErroRegistarCategoria(false);
                    }, 5000);
                }
            }
        });
    }

    async function registarAssociacao( info ){
        await axios.post(
            config.LINK_API + "/category",
            info,
            { headers: {'Content-Type': 'application/json'}},
        ).then( ( res ) => {

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

            }
        });
    }

    return(
        <div>
        <h1>Registo de uma categoria nova</h1>
        <br/>
        <Formik
            initialValues={
                { campos: ['Cor', 'Marca' ], camposTipo: ['text', 'text'] ,categoria: '' }
            }
            validate={validate}
            onSubmit={values => {
                registarCategoriaNova( { nomeCat: values.categoria } );
                values.campos.map( (campo, index) => {
                    let campoNovo = { nomeCampo: campo, tipoValor: values.camposTipo[index], valores: null }
                    registarCampoDaCategoria(campoNovo);

                    let associarCampoACategoria = { cat: values.categoria, campo: campo };
                    registarAssociacao(associarCampoACategoria);
                })
            }
          }
        >
        {({ values, handleBlur, handleChange, handleSubmit, errors }) => (
        <Form onSubmit={handleSubmit}>
            <FieldArray
                name="campos"
                render={arrayHelpers => (
                    <div>
                    <Form.Label htmlFor="categoria">Nome da nova categoria:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="categoria"
                        name="categoria"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.categoria}

                    />
                    { erroRegistarCategoria ? (<p className='text-danger'> Erro, esta categoria já existe </p>) : null }
                    { errors.categoria ? (<p className='text-danger'> {errors.categoria} </p>) : null }
                    <br/>
                    <Form.Label htmlFor="categoria">Campos da nova categoria:<span className='text-danger'>*</span>  </Form.Label>
                        { values.campos.map((campo, index) => {
                            return (
                            <div key={index}>
                                <Container className='text-center'>
                                    <Form.Label htmlFor={`campos.${index}`}>Nome do campo #{index+1}: </Form.Label>
                                    &nbsp;
                                    &nbsp;
                                    <Field name={`campos.${index}`}/>

                                    &nbsp; &nbsp;

                                    {/** TODO: Select para os tipos de dados, validação e submit */}
                                    {/** TODO 2: Verificar se o remover retira dos dados do form. */}
                                    <Form.Label htmlFor={`camposTipo.${index}`}>Tipo de valor do campo #{index+1}: </Form.Label>
                                    &nbsp;
                                    &nbsp;
                                    <Field as={"select"} name={`camposTipo.${index}`}>
                                        <option value="text">Texto</option>
                                        <option value="number">Numérico</option>
                                    </Field>

                                    &nbsp; &nbsp;

                                    <Button type="button" variant='danger' disabled={true ? values.campos.length === 1 : false} onClick={() => {removerCampo(arrayHelpers, index)}} >
                                        Remover
                                    </Button>
                                </Container>
                                <br/>
                            </div>
                        )})}
                        <br/>
                        <Container className='text-center'>
                            { errors.campos ? (<p className='text-danger'> {errors.campos} </p>) : null }
                            { categoriaCriadaComSucesso ? (<p className='text-success'> Categoria "{values.categoria}" criada com sucesso. </p>) : null }
                            <Button type="button" onClick={() => arrayHelpers.insert(values.campos.length, '')} >
                                Adicionar campo novo
                            </Button>
                        </Container>
                    </div>
                )}
            />
            <br/>
            <Container className='text-center'>
                <Button type="submit">Criar</Button>
            </Container>
            </Form>
        )}
        </Formik>
      </div>
    )
}

export default FormCategorias;
 