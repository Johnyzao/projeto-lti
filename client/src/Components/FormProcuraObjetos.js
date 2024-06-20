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

// TODO: Clicar no objeto para mostrar a info.
function FormProcuraObjetos() {

    const [metodoProcura, setMetodoProcura] = useState("desc");
    const [objetosEncontrados, setObjetosEncontrados] = useState([]);

    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState({});
    const [camposDaCategoria, setCamposDaCategoria] = useState([]);
    const [tiposDosCampos, setTiposDosCampos] = useState({});

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

    async function procurarPorCampos(cat, campos) {
        await axios.post(
            config.LINK_API + "/lostObject/searchByField",
            {cat: cat, campos: campos},
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

    async function procurarPorCat(cat) {
        await axios.get(
            config.LINK_API + "/lostObject/searchByCategory/" + cat,
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

    function obterInfoCampo(nomeCampo){
        axios.get(
            config.LINK_API + "/field/" + nomeCampo ,
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            let tiposAtuais = tiposDosCampos;
            if ( tiposAtuais[nomeCampo] === undefined ) {
                tiposAtuais[nomeCampo] = res.data[0].tipo_valor;
            }
            setTiposDosCampos( tiposAtuais );
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function obterCampos(nomeCategoria) {
        if ( nomeCategoria !== "" ) {
            axios.get(
                config.LINK_API + "/categoryFields/" + nomeCategoria ,
                { headers: {'Content-Type': 'application/json'}},
            ).then ( (res) => {
                let campos = [];
                res.data.map( campo => {
                    campos.push(campo.campo);
                })
                setCamposDaCategoria( campos );
            }).catch(function (error) {
                if ( error.response ) {
                    let codigo = error.response.status;
                }
            });
        }
    }

    async function obterCategorias() {
        await axios.get(
            config.LINK_API + "/category", 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            let categoriasECampos = {};
            res.data.categorias.map( campo => {
                if ( categoriasECampos[campo.cat] === undefined ) {
                    categoriasECampos[campo.cat] = new Array();
                }
                categoriasECampos[campo.cat].push( campo.campo );

            })
            setCategorias(categoriasECampos);
            obterCampos(categoria); 

        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function obterValorDoCampo(nomeCampo) {
        let valor = document.forms['form'][''+nomeCampo].value;
        return valor;
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
            if ( metodoProcura === "desc" ) {
                procurarPorDesc(values.desc);
            } else {
                let camposUsados = false;
                let camposPreenchidos = {};
                camposDaCategoria.map( campo => {
                    let valor = obterValorDoCampo(campo);
                    if ( valor !== "" ) {
                        camposUsados = true;
                        camposPreenchidos[campo+""] = valor;
                    }
                });

                if ( camposUsados ) {
                    procurarPorCampos(categoria, camposPreenchidos)
                } else {
                    procurarPorCat(categoria);
                }

            }
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

    const desenharCategorias = Object.keys(categorias).map( cat => {
        return (<option key={cat} value={cat}> {cat} </option>);
    });

    const desenharCamposDaCategoria = camposDaCategoria.map( campo => {
        obterInfoCampo( campo );
        return(
            <div key={campo}>
                <Form.Label htmlFor={campo}> {campo}: </Form.Label>
                <Form.Control                    
                id={campo}
                name={campo}
                type={""+tiposDosCampos[campo]} 
                />
                <Form.Text muted>Introduza um valor { tiposDosCampos[campo] === "text" ? "alfanumérico" : "numérico" }. </Form.Text>
            </div>
        );
    });

    useEffect( () => { setObjetosEncontrados([]) }, [] );
    useEffect( () => { obterCategorias() }, [] );
    useEffect( () => { setCategoria( Object.keys(categorias)[0] ) }, [categorias] );
    useEffect( () => { obterCampos(categoria) }, [categoria] );
    return (
        <>
            <Container className='bg-light' fluid="sm">

                <h1>Procura de objetos perdidos</h1>
                <br/>

                <Form name="form" onSubmit={formik.handleSubmit}>

                <Form.Label>Método de procura: </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="procura"
                        name="procura"
                        defaultValue={'desc'}
                        onChange={(e) => {setMetodoProcura(e.target.value)}}
                    >
                        <option value='desc'> Descrição </option>
                        <option value='cats'> Categoria </option>
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
                    <>
                        <Form.Label htmlFor="categoria">Categoria:<span className='text-danger'>*</span> </Form.Label>
                            <Form.Select                    
                            id="categoria"
                            name="categoria"
                            onChange={(e) => {setCategoria(e.target.value);}}>
                                {desenharCategorias}
                            </Form.Select>
                        <Form.Text muted>Se não escrever os campos, a procura aplica-se apenas à categoria escolhida.</Form.Text>
                        <br/>
                        
                        { desenharCamposDaCategoria }

                        <br/>
                    </>
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