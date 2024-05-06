import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';

// Informacoes da API.
import config from '../config';

// https://www.npmjs.com/package/axios
// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import validator from 'validator';

// https://formik.org/docs/tutorial
import { useFormik } from 'formik';

// Imports do bootstrap.
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

function FormEditarObjetoPerdido() {
    const navigate = useNavigate();
    let fakeprops = 1;

    // {data_url: ..., file: null}
    // Pro implementar aqui...
    const [images, setImages] = useState([]);
    const [distrito, setDistrito] = useState("Aveiro");

    // TODO:
    //const [categoriasCriadas, setCategoriasCriadas] = useState(false);
    const maxNumber = 3;

    const [objeto, setObjeto] = useState({});
    const [objetoObtido, setObjetoObtido] = useState(false);
    const [objetoPerdido, setObjetoPerdido] = useState({});
    const [localizacao, setLocalizacao] = useState({});

    const [ sucessoObjetoPerdidoAtualizado, setSucessoObjetoPerdidoAtualizado ] = useState(false);

    function obterObjeto(idObjeto) {
        axios.get(
            config.LINK_API + "/object/" + idObjeto, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjeto(res.data.obj);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }    
  
    function obterObjetoPerdido(idObjetoPerido) {
        axios.get(
            config.LINK_API + "/lostObject/" + idObjetoPerido, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setObjetoPerdido(res.data.objPerdido);
            setObjetoObtido(true);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function obterLocalizacao(idLoc) {
        axios.get(
            config.LINK_API + "/location/" + idLoc, 
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
            setLocalizacao(res.data.loc);
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function atualizarObjeto(novaInfoObjeto) {
        axios.put(
            config.LINK_API + "/object", 
            novaInfoObjeto ,
            { headers: {'Content-Type': 'application/json' }}
        ).then( (res) => {
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function atualizarObjetoPerdido(novaInfoObjetoPerdido) {
        axios.put(
            config.LINK_API + "/lostObject", 
            novaInfoObjetoPerdido ,
            { headers: {'Content-Type': 'application/json' }}
        ).then( (res) => {
        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function atualizarLocalizacao(novaInfoLoc) {
        axios.put(
            config.LINK_API + "/location", 
            novaInfoLoc ,
            { headers: {'Content-Type': 'application/json' }}
        ).then( (res) => {
            setSucessoObjetoPerdidoAtualizado(true);

            setTimeout(() => {
                setSucessoObjetoPerdidoAtualizado(false);
            }, 5000);

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    // TODO: Falar com o stor...
    async function obterCategorias(){
        await axios.post(

            );
    }

    const onChange = (imageList, addUpdateIndex) => {
        setImages(imageList);
    }

    const validate = values => {
        const errors = {};
        
        values.titulo === "" 
            ? errors.titulo = "Por favor escreva um título." 
            : delete errors.titulo;
        
        values.desc === "" 
            ? errors.desc = "Por favor escreva uma descrição." 
            : delete errors.desc;

        validator.isAlpha( values.freg, "pt-PT" )
            ? delete errors.freg
            : errors.freg = "Por favor escreva o nome de uma freguesia."

        validator.isAlpha( values.munc, "pt-PT" )
            ? delete errors.munc
            : errors.munc = "Por favor escreva o nome de um município."

        validator.isPostalCode(values.codp, "PT")
            ? delete errors.codp 
            : errors.codp = "Por favor escreva um código postal válido.";

        if ( values.freg === "" ) {
            delete errors.freg;
        }
        if ( values.munc === "" ) {
            delete errors.munc;
        }
        if ( values.codp === "" ) {
            delete errors.codp;
        }

        return errors;
    }

    useEffect( () => { obterObjetoPerdido(fakeprops) }, [] );
    useEffect( () => { obterObjeto( objetoPerdido.id ) }, [objetoObtido === true] );
    useEffect( () => { obterLocalizacao( objetoPerdido.perdido_em ) }, [objetoObtido === true] );

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            titulo: objeto.titulo,
            desc:   objeto.descricao,
            pais:   "Portugal",
            munc:   localizacao.munc    === null ? "" : localizacao.munc, 
            freg:   localizacao.freg    === null ? "" : localizacao.freg,
            rua:    localizacao.rua     === null ? "" : localizacao.rua,
            morada: localizacao.morada  === null ? "" : localizacao.morada,
            codp:   localizacao.codp    === null ? "" : localizacao.codp
        },
        validate,
        validateOnChange:false,
        validateOnBlur:false,
        onSubmit: values => {

            let infoObjetoAEnviar = { 
                idObj : fakeprops,
                titulo: values.titulo, 
                desc: values.desc,
                imagens: images,
            }
            atualizarObjeto(infoObjetoAEnviar);

            let novaLoc = {
                id: objetoPerdido.perdido_em,
                pais: values.pais,
                dist: distrito,                
                munc: values.munc, 
                freg: values.freg,
                rua: values.rua,
                morada: values.morada,
                codp: values.codp
            }
            atualizarLocalizacao(novaLoc);

        },
    });

    return (
        <>
            <Container className='bg-light' fluid="sm">
                <h1 className='text-center'> Edição de objeto perdido </h1>

                <Form onSubmit={formik.handleSubmit}>
                <br/>
                <h4>Informações do anúncio do objeto</h4>
                <Form.Group className='border'>
                    <Form.Label htmlFor="titulo">Título do anúncio:<span className='text-danger'>*</span> </Form.Label>
                    <Form.Control                     
                        id="titulo"
                        name="titulo"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.titulo}/>
                    <Form.Text muted>Escreva um título curto.</Form.Text>
                    { formik.errors.titulo ? (<p className='text-danger'> {formik.errors.titulo} </p>) : null }
                <br/>
                    <Form.Label htmlFor="desc">Descrição: </Form.Label>
                    <Form.Control as={"textarea"}                         
                        id="desc"
                        name="desc"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.desc}/>
                    <Form.Text muted>Na descrição pode incluir quaisquer detalhes que ache relevantes.</Form.Text>
                    { formik.errors.desc ? (<p className='text-danger'> {formik.errors.desc} </p>) : null }
                <br/>
   
                <p>Imagens do objeto: </p>
                <p>Pode adicionar no máximo 3 imagens ao anúncio. </p>
                <ImageUploading
                    multiple
                    value={images}
                    onChange={onChange}
                    maxNumber={maxNumber}
                    dataURLKey="data_url"
                    >
                        {({
                        imageList,
                        onImageUpload,
                        onImageRemoveAll,
                        onImageUpdate,
                        onImageRemove,
                        isDragging,
                        dragProps,
                        }) => (
                        <Container fluid className="upload__image-wrapper text-center">
                            <Button
                                variant={isDragging ? 'warning' : undefined}
                                onClick={onImageUpload}
                                {...dragProps}
                            >
                            Adicionar imagem
                            </Button>
                            &nbsp;
                            <Button variant='danger' onClick={onImageRemoveAll}>Remover todas as imagens</Button>
                            <br/>
                            <br/>
                            { imageList.length === 0 ? (<p>Não adicionou nenhuma foto ainda.</p>) : (<p>Imagens que adicionou:</p>) }
                            <Container>
                            {imageList.map((image, index) => (
                                <Container key={index} fluid="sm" className="image-item">
                                    <Image src={image['data_url']} fluid thumbnail width="100" />
                                    <Container fluid className="image-item__btn-wrapper">
                                        <Button onClick={() => onImageUpdate(index)}>Trocar</Button>
                                        <Button variant='danger' onClick={() => onImageRemove(index)}>Remover</Button>
                                    </Container>
                                </Container>
                            ))}
                            </Container>
                        </Container>
                        )}
                    </ImageUploading>
                </Form.Group>
                
                <br/>
                <br/>
                <h4>Informações acerca da localização onde perdeu o objeto</h4>
                <Form.Group className='border'>
                    <Form.Label htmlFor="pais">País: </Form.Label>
                    <Form.Control value={"Portugal"} disabled/>
                    <Form.Text muted>Portugal é o único país suportado.</Form.Text>
                <br/>
                    <Form.Label htmlFor="distrito">Distrito:<span className='text-danger'>*</span> </Form.Label>
                    <Form.Select                    
                        id="dist"
                        name="dist"
                        onChange={(e) => {setDistrito(e.target.value)}}>
                        <option values="Aveiro">Aveiro</option>
                        <option values="Beja">Beja</option>
                        <option values="Braga">Braga</option>
                        <option values="Bragança">Bragança</option>
                        <option values="Castelo Branco">Castelo Branco</option>
                        <option values="Coimbra">Coimbra</option>
                        <option values="Évora">Évora</option>
                        <option values="Faro">Faro</option>
                        <option values="Guarda">Guarda</option>
                        <option values="Leiria">Leiria</option>
                        <option values="Lisboa">Lisboa</option>
                        <option values="Porto">Porto</option>
                        <option values="Santarém">Santarém</option>
                        <option values="Setúbal">Setúbal</option>
                        <option values="Viana do Castelo">Viana do Castelo</option>
                        <option values="Vila Real">Vila Real</option>
                        <option values="Viseu">Viseu</option>
                    </Form.Select>
                <br/>
                <br/>

                <p> Se introduzir algum dos campos abaixo, garanta que existe. </p>
                    <Form.Label htmlFor="munc">Município: </Form.Label>
                    <Form.Control                        
                        id="munc"
                        name="munc"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.munc}/>
                { formik.errors.munc ? (<p className='text-danger'> {formik.errors.munc} </p>) : null } 

                <br/>
                    <Form.Label htmlFor="freg">Freguesia: </Form.Label>
                    <Form.Control                        
                        id="freg"
                        name="freg"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.freg}/>
                { formik.errors.freg ? (<p className='text-danger'> {formik.errors.freg} </p>) : null }             

                <br/>
                    <Form.Label htmlFor="rua">Rua: </Form.Label>
                    <Form.Control                        
                        id="rua"
                        name="rua"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.rua}/>
                { formik.errors.rua ? (<p className='text-danger'> {formik.errors.rua} </p>) : null } 

                <br/>
                    <Form.Label htmlFor="morada">Morada: </Form.Label>
                    <Form.Control                         
                        id="morada"
                        name="morada"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.morada}/>
                { formik.errors.morada ? (<p className='text-danger'> {formik.errors.morada} </p>) : null } 

                <br/>
                    <Form.Label htmlFor="codp">Código postal: </Form.Label>
                    <Form.Control                        
                        id="codp"
                        name="codp"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.codp}/>
                <Form.Text className="text-muted">Um código postal tem o formato: XXXX-XXX.</Form.Text> 
                { formik.errors.codp ? (<p className='text-danger'> {formik.errors.codp} </p>) : null } 

                <br/>
                </Form.Group>

                <br/>
                <br/>
                <h4>Categorização do objeto</h4>
                <Form.Group className='border'>
                <p>Crie categorias que ache úteis para descrever o objeto e associe-as ao objeto em questão.</p>

                </Form.Group>

                <br/>
                <Container className='text-center'>
                    { sucessoObjetoPerdidoAtualizado ? (<p className='text-success'>Objeto atualizado com sucesso.</p>) : null }
                    <br/>
                    <Button type="submit"> Atualizar anúncio </Button>
                    &ensp; 
                    &ensp;
                    <Button type=""> Reset </Button>
                </Container>
                </Form>
            </Container>
        </>
    )
}

export default FormEditarObjetoPerdido;
