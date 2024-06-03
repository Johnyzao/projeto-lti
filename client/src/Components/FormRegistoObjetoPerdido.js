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

function FormRegistoObjetoPerdido() {
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [sabeData, setSabeData] = useState(false);
    const [naoSabeData, setNaoSabeData] = useState(false);
    const [distrito, setDistrito] = useState("Aveiro");
    const [erroInternoRegistoPerdido, setErroInternoRegistoPerdido] = useState(false);

    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState(new Object());
    const [camposDaCategoria, setCamposDaCategoria] = useState([]);
    const [tiposDosCampos, setTiposDosCampos] = useState(new Object());

    const maxNumber = 3;

    function obterValorDoCampo(nomeCampo) {
        let valor = document.forms['form'][''+nomeCampo].value;
        return valor;
    }

    function registarValorDoCampo(idObj, campo, valor) {
        axios.post(
            config.LINK_API + "/object/setField",
            { idObj: idObj, campo: campo, valor: valor },
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
        }).catch(function (error) {
            if ( error.response ) {
                let codigo = error.response.status;
            }
        });
    }

    function processarObjeto(infoObjeto, infoLocalizacao, values) {
        axios.post(
            config.LINK_API + "/object", 
            infoObjeto, 
            { headers: {'Content-Type': 'application/json'}},

        ).then ( (res) => {
            if (res.status === 201) {
                let idObj = res.data.id;

                camposDaCategoria.map( campo => {
                    let valor = obterValorDoCampo(campo);
                    registarValorDoCampo( idObj, campo, valor );
                });

                axios.post(
                    config.LINK_API + "/location", 
                    infoLocalizacao, 
                    { headers: {'Content-Type': 'application/json'}},
                ).then ( (res) => {
                    if (res.status === 201) {
                        let idLoc = res.data.id;

                        let infoObjetoPerdido = {
                            idObj: idObj,
                            idLoc: idLoc,
                            lostDate: values.lostDate,
                            lostTime: values.lostTime,
                            lostDateInfLim: values.lostDateInfLim,
                            lostDateSupLim: values.lostDateSupLim
                        }

                        axios.post(
                            config.LINK_API + "/lostObject", 
                            infoObjetoPerdido, 
                            { headers: {'Content-Type': 'application/json'}},
                        ).then ( (res) => {
                            if (res.status === 201) {
                                setErroInternoRegistoPerdido(false);
                            } 
                        }).catch(function (error) {
                            if ( error.response ) {
                                setErroInternoRegistoPerdido(true);
                            }
                        });

                    } 
                }).catch(function (error) {
                    if ( error.response ) {
                        setErroInternoRegistoPerdido(true);
                    }
                });

            } 
        }).catch(function (error) {
            if ( error.response ) {
                setErroInternoRegistoPerdido(true);
            }
        })
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

        }).catch(function (error) {
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

    const onChange = (imageList, addUpdateIndex) => {
        setImages(imageList);
    }

    const handleChangeSabeData = () => {
        setSabeData( true );
        setNaoSabeData( false );
    }

    const handleChangeNaoSabeData = () => {
        setSabeData( false );
        setNaoSabeData( true );
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

        let dataAtual = new Date();
        sabeData && dataAtual.getTime() < new Date(values.lostDate).getTime()
            ? errors.lostDate = "Por favor insira uma data válida."
            : delete errors.lostDate;
        
        let horasPerdidasSabe = values.lostTime.split(":");
        sabeData && (parseInt( horasPerdidasSabe[0] ) <= 23 && parseInt( horasPerdidasSabe[1] ) <= 59) 
            ? delete errors.lostTime
            : errors.lostTime = "Por favor insira uma hora válida.";

        naoSabeData && dataAtual.getTime() < new Date(values.lostDateInfLim).getTime()
            ? errors.lostDateInfLim = "Por favor insira uma data válida."
            : delete errors.lostDateInfLim;

        naoSabeData && dataAtual.getTime() < new Date(values.lostDateSupLim).getTime()
            ? errors.lostDateSupLim = "Por favor insira uma data válida."
            : delete errors.lostDateSupLim;

        naoSabeData && new Date(values.lostDateInfLim).getTime() > new Date(values.lostDateSupLim).getTime()
            ? errors.lostDateInfLim = "O limite inferior não pode ser uma data depois do fim do intervalo."
            : delete errors.lostDateInfLim;
        
        naoSabeData && new Date(values.lostDateSupLim).getTime() < new Date(values.lostDateInfLim).getTime()
            ? errors.lostDateSupLim = "O limite superior não pode ser uma data antes do começo do intervalo."
            : delete errors.lostDateSupLim;

        if ( values.freg === "" ) {
            delete errors.freg;
        }
        if ( values.munc === "" ) {
            delete errors.munc;
        }
        if ( values.codp === "" ) {
            delete errors.codp;
        }
        if ( values.lostTime === "" ){
            delete errors.lostTime;
        }
        if (values.lostDate === "" && sabeData) {
            errors.lostDate = "Por favor introduza a data em que perdeu o objeto.";
        }
        if ( values.lostDateInfLim === "" && naoSabeData){
            errors.lostDateInfLim = "Por favor introduza a data do inferior intervalo.";
        }
        if ( values.lostDateSupLim === "" && naoSabeData){
            errors.lostDateSupLim = "Por favor introduza a data superior do intervalo.";
        }

        return errors;
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            titulo:"",
            desc:"",
            pais:"Portugal",
            lostDate:"",
            lostTime:"",
            munc:"",
            lostDateInfLim:"",
            lostDateSupLim:"",
            freg:"",
            rua:"",
            morada: "",
            codp:""
        },
        validate,
        validateOnChange:false,
        validateOnBlur:false,
        onSubmit: values => {

            let dias = new Date().getDate();
            let mes = new Date().getMonth() + 1;
            let ano = new Date().getFullYear();
            
            let dataAtual = dias + "/" + mes + "/" + ano;
            let infoObjeto = { 
                titulo: values.titulo, 
                nifUser: JSON.parse(localStorage.getItem("dados")).nif, 
                desc: values.desc,
                imagens: images,
                dataRegisto: dataAtual,
                categoria: categoria,
            }

            let infoLocalizacao = {
                pais: values.pais,
                dist: distrito,                
                munc: values.munc,
                freg: values.freg,
                rua: values.rua,
                morada: values.morada,
                codp: values.codp
            }
            processarObjeto(infoObjeto, infoLocalizacao, values);

            if ( !erroInternoRegistoPerdido ) {
                navigate("/lostObject/register/success");
            }
        },
    });

    useEffect( () => { obterCategorias() }, [] );
    useEffect( () => { setCategoria( Object.keys(categorias)[0] ) }, [categorias] );
    useEffect( () => { obterCampos(categoria) }, [categoria] );

    const desenharCategorias = Object.keys(categorias).map( cat => {
        return (<option key={cat} value={cat}> {cat} </option>);
    });

    const desenharCamposDaCategoria = camposDaCategoria.map( campo => {
        obterInfoCampo( campo );
        return(
            <>
                <Form.Label htmlFor={campo}> {campo}: </Form.Label>
                <Form.Control                    
                id={campo}
                name={campo}
                type={""+tiposDosCampos[campo]} 
                />
                <Form.Text muted>Introduza um valor { tiposDosCampos[campo] === "text" ? "alfanumérico" : "numérico" }. </Form.Text>
                <br/>
            </>
        );
    });

    return (
        <>
            <Container className='bg-light' fluid="sm">
                <h1 className='text-center'> Registo de um objeto perdido </h1>

                <Form name='form' onSubmit={formik.handleSubmit}>
                
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
                    <Form.Label htmlFor="data">Informações acerca da data em que perdeu o objeto:<span className='text-danger'>*</span> </Form.Label>

                <div>
                    <Form.Check 
                        type="radio" 
                        name="grupo1" 
                        label="Não sei a data em que perdi o objeto" 
                        onChange={handleChangeNaoSabeData}
                    />
                    <Form.Check 
                        type="radio" 
                        name="grupo1" 
                        label="Eu sei quando perdi o objeto" 
                        onChange={handleChangeSabeData}    
                    />
                </div>
                { sabeData === false && naoSabeData === false ? (<p className='text-danger'> Por favor selecione uma desta opções. </p>) : null }
                <br/>
                    { sabeData ? (
                        <>
                            <Form.Label>Data em que perdeu o objeto:<span className='text-danger'>*</span> </Form.Label>
                            <Form.Control 
                                type="date"                         
                                id="lostDate"
                                name="lostDate"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lostDate}/>
                            { formik.errors.lostDate ? (<p className='text-danger'> {formik.errors.lostDate} </p>) : null }
                            <br/>
                            <Form.Label>Horas em que perdeu o objeto: </Form.Label>
                            <Form.Control                        
                                id="lostTime"
                                name="lostTime"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lostTime}/>
                            { formik.errors.lostTime ? (<p className='text-danger'> {formik.errors.lostTime} </p>) : null }
                            <Form.Text muted>Utilize o formato Horas:Minutos. Se não souber exatamente, estime as horas a que acha que perdeu o objeto.</Form.Text>
                        </>
                    ) : null }

                    { naoSabeData ? (
                        <>  
                            <p>Defina um intervalo no qual adimite ter perdido o objeto:<span className='text-danger'>*</span> </p>

                            <Form.Label>Começo do intervalo:<span className='text-danger'>*</span> </Form.Label>
                            <Form.Control                                 
                                type="date"                         
                                id="lostDateInfLim"
                                name="lostDateInfLim"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lostDateInfLim}/>
                            { formik.errors.lostDateInfLim ? (<p className='text-danger'> {formik.errors.lostDateInfLim} </p>) : null } 

                            <Form.Label>Fim do intervalo:<span className='text-danger'>*</span> </Form.Label>
                            <Form.Control                                 
                                type="date"                         
                                id="lostDateSupLim"
                                name="lostDateSupLim"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lostDateSupLim}/>
                            { formik.errors.lostDateSupLim ? (<p className='text-danger'> {formik.errors.lostDateSupLim} </p>) : null } 
                        </>
                    ) : null }

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
                <p>Escolha uma categoria que ache útil para descrever o objeto e preencha os campos.</p>
                <Form.Label htmlFor="categoria">Categoria:<span className='text-danger'>*</span> </Form.Label>
                    <Form.Select                    
                        id="categoria"
                        name="categoria"
                        onChange={(e) => {setCategoria(e.target.value);}}
                    >
                        {desenharCategorias}
                    </Form.Select>
                <br/>
                { desenharCamposDaCategoria }

                </Form.Group>

                <br/>
                <Container className='text-center'>
                    { erroInternoRegistoPerdido ? (<p>Erro interno, por favor tente de novo.</p>) : null }
                    <Button type="submit"> Criar anúncio </Button>
                </Container>
                </Form>
            </Container>
        </>
    )
}

export default FormRegistoObjetoPerdido;
