import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';

// mapbox
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';


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

import { useAuth0 } from "@auth0/auth0-react";

function FormRegistoObjetoAchado() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth0();

    const [images, setImages] = useState([]);
    const [sabeData, setSabeData] = useState(false);
    const [naoSabeData, setNaoSabeData] = useState(false);
    const [distrito, setDistrito] = useState("Aveiro");
    const [erroInternoRegistoAchado, setErroInternoRegistoAchado] = useState(false);

    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState(new Object());
    const [camposDaCategoria, setCamposDaCategoria] = useState([]);
    const [tiposDosCampos, setTiposDosCampos] = useState(new Object());

    const maxNumber = 3;

    function obterValorDoCampo(nomeCampo) {
        console.log("Nome do campo: " + nomeCampo);
        console.log("Documentos: " + document.forms['form']);
        let valor = document.forms['form'][''+nomeCampo].value;
        return valor;
    }

    function registarValorDoCampo(idObj, campo, valor) {
        console.log("A CHEGAR AO SET FIELD");
        axios.post(
            config.LINK_API + "/object/setField",
            { idObj: idObj, campo: campo, valor: valor },
            { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
        }).catch(function (error) {
            if ( error.response ) {
                console.log(error.response);
                console.log("OBJECT ERROR");
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
            console.log(res.status);
            console.log("TEST2");
            if (res.status === 201) {
                console.log(res.data);
                let idObj = res.data.id;
                console.log("ANTES DO SET FIELD");
                console.log(camposDaCategoria);
                camposDaCategoria.map( campo => {
                    let valor = obterValorDoCampo(campo);
                    console.log("VALUR DO CAMP: " + valor);
                    registarValorDoCampo( idObj, campo, valor );
                });
                console.log("DEPOIS DO SET FIELD");
                axios.post(
                    config.LINK_API + "/location", 
                    infoLocalizacao, 
                    { headers: {'Content-Type': 'application/json'}},
                ).then ( (res) => {
                    console.log("TEST3");
                    console.log(res.status);
                    if (res.status === 201) {
                        let idLoc = res.data.id;

                        let infoObjetoAchado= {
                            idObj: idObj,
                            idLoc: idLoc,
                            policia: user.sub.split("|")[1],
                            foundDate: values.foundDate,
                            foundTime: values.foundTime,
                            foundDateInfLim: values.foundDateInfLim,
                            foundDateSupLim: values.foundDateSupLim
                        }
                        console.log(infoObjetoAchado);
                        console.log("TEST")
                        axios.post(
                            config.LINK_API + "/foundObject", 
                            infoObjetoAchado, 
                            { headers: {'Content-Type': 'application/json'}},
                        ).then ( (res) => {
                            if (res.status === 201) {
                                setErroInternoRegistoAchado(false);
                            } 
                        }).catch(function (error) {
                            if ( error.response ) {
                                setErroInternoRegistoAchado(true);
                            }
                        });

                    } 
                }).catch(function (error) {
                    console.log(error)
                    console.log("ERRO?")
                    if ( error.response ) {
                        setErroInternoRegistoAchado(true);
                    }
                });
                console.log("TEST4");
            } 
        }).catch(function (error) {
            console.log("TEST5");
            console.log(error);
            if ( error.response ) {
                setErroInternoRegistoAchado(true);
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
        sabeData && dataAtual.getTime() < new Date(values.foundDate).getTime()
            ? errors.foundDate = "Por favor insira uma data válida."
            : delete errors.foundDate;
        
        let horasPerdidasSabe = values.foundTime.split(":");
        sabeData && (parseInt( horasPerdidasSabe[0] ) <= 23 && parseInt( horasPerdidasSabe[1] ) <= 59) 
            ? delete errors.foundTime
            : errors.foundTime = "Por favor insira uma hora válida.";

        naoSabeData && dataAtual.getTime() < new Date(values.foundDateInfLim).getTime()
            ? errors.foundDateInfLim = "Por favor insira uma data válida."
            : delete errors.foundDateInfLim;

        naoSabeData && dataAtual.getTime() < new Date(values.foundDateSupLim).getTime()
            ? errors.foundDateSupLim = "Por favor insira uma data válida."
            : delete errors.foundDateSupLim;

        naoSabeData && new Date(values.foundDateInfLim).getTime() > new Date(values.foundDateInfLim).getTime()
            ? errors.foundDateInfLim = "O limite inferior não pode ser uma data depois do fim do intervalo."
            : delete errors.foundDateInfLim;
        
        naoSabeData && new Date(values.foundDateSupLim ).getTime() < new Date(values.foundDateInfLim).getTime()
            ? errors.foundDateSupLim  = "O limite superior não pode ser uma data antes do começo do intervalo."
            : delete errors.foundDateSupLim ;

        if ( values.freg === "" ) {
            delete errors.freg;
        }
        if ( values.munc === "" ) {
            delete errors.munc;
        }
        if ( values.codp === "" ) {
            delete errors.codp;
        }
        if ( values.foundTime === "" ){
            delete errors.foundTime;
        }
        if (values.foundDate === "" && sabeData) {
            errors.foundDate = "Por favor introduza a data em que perdeu o objeto.";
        }
        if ( values.foundDateInfLim === "" && naoSabeData){
            errors.foundDateInfLim = "Por favor introduza a data do inferior intervalo.";
        }
        if ( values.foundDateSupLim === "" && naoSabeData){
            errors.foundDateSupLim = "Por favor introduza a data superior do intervalo.";
        }

        return errors;
    }

    const mapContainerRef = useRef(null);
    const userLocationMarker = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const selectedLocationMarker = useRef(null);
    const [selectedLocationCoordinates, setSelectedLocationCoordinates] = useState(null);


    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbmEyNCIsImEiOiJjbHhvanZwbHcwNXBoMmpxeXlsaW45b29pIn0.8-giJPprtRSTtpSNHowNng';

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-8.0, 39.5],
            zoom: 6
        });
        
        const addMarker = (lng, lat, color, markerRef) => {
            if (markerRef.current) {
                markerRef.current.remove();
            }

            const newMarker = new mapboxgl.Marker({
                color,
                draggable: false
            })
            .setLngLat([lng, lat])
            .addTo(map);

            markerRef.current = newMarker;
            setSelectedLocation({ lng, lat });
            setSelectedLocationCoordinates({ lng, lat });
        };

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            setSelectedLocation({ lng, lat });
            setSelectedLocationCoordinates({ lng, lat });
            addMarker(lng, lat, '#ff0000', selectedLocationMarker);
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setCenter([longitude, latitude]);
                    map.setZoom(12);
                    addMarker(longitude, latitude, '#0000ff', userLocationMarker);
                },
                (error) => {
                    console.error('Error retrieving location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }

        return () => map.remove();
    }, [user]);


    const geocodingClient = mbxGeocoding({ accessToken: 'pk.eyJ1Ijoiam9hbmEyNCIsImEiOiJjbHd6aW1oY2IwNzQ3MmpxdWY1dXJkaTh3In0.ynaz2urwBsr7vgv0Pn9ppg' });

    const useStreetName = (selectedLocationCoordinates) => {
        const [streetName, setStreetName] = useState('');
    
        useEffect(() => {
            const fetchStreetName = async () => {
                if (selectedLocationCoordinates) {
                    try {
                        const response = await geocodingClient.reverseGeocode({
                            query: [selectedLocationCoordinates.lng, selectedLocationCoordinates.lat],
                            types: ['address'],
                        }).send();
    
                        const match = response.body.features[0];
                        if (match) {
                            setStreetName(match.place_name);
                        }
                    } catch (error) {
                        console.error('Error fetching street name:', error);
                    }
                }
            };
    
            fetchStreetName();
        }, [selectedLocationCoordinates]);
    
        return streetName;
    };

    //const streetName = useStreetName(selectedLocationCoordinates);

    const streetName = useStreetName(selectedLocationCoordinates);

    const getAddress = () => {
        if (streetName === '') return '';
        return streetName.split(",")[0];
    };

    const getPostalCode = () => {
        if (streetName === '') return '';
        return streetName.split(",")[1].substring(1, 9);
    };

    const getMunicipality = () => {
        if (streetName === '') return '';
        return streetName.split(",")[2].substring(1);
    };

    const getCoords = () => {
        if (selectedLocationCoordinates === null) return '';
        return selectedLocationCoordinates.lat + ", " + selectedLocationCoordinates.lng;
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            titulo:"",
            desc:"",
            pais:"Portugal",
            foundDate:"",
            foundTime:"",
            munc:"",
            foundDateInfLim:"",
            foundDateSupLim:"",
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
                nifUser: null, 
                desc: values.desc,
                imagens: images,
                dataRegisto: dataAtual,
                categoria: categoria,
            }
            console.log(camposDaCategoria);

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
        },
    });

    useEffect(() => { formik.setFieldValue('rua', getAddress()); }, [streetName]);
    useEffect(() => { formik.setFieldValue('codp', getPostalCode()); }, [streetName]);
    useEffect(() => { formik.setFieldValue('munc', getMunicipality()); }, [streetName]);
        
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
        { isLoading ? null : (
            <Container className='bg-light' fluid="sm">
            <h1 className='text-center'> Registo de um objeto achado </h1>

            <Form name="form" onSubmit={formik.handleSubmit}>
            
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
                <Form.Label htmlFor="data">Informações acerca da data em que achou o objeto:<span className='text-danger'>*</span> </Form.Label>

            <div>
                <Form.Check 
                    type="radio" 
                    name="grupo1" 
                    label="Não sei a data em que achei o objeto." 
                    onChange={handleChangeNaoSabeData}
                />
                <Form.Check 
                    type="radio" 
                    name="grupo1" 
                    label="Eu sei a data em que achei o objeto." 
                    onChange={handleChangeSabeData}    
                />
            </div>
            { sabeData === false && naoSabeData === false ? (<p className='text-danger'> Por favor selecione uma desta opções. </p>) : null }
            <br/>
                { sabeData ? (
                    <>
                        <Form.Label>Data em que achou o objeto:<span className='text-danger'>*</span> </Form.Label>
                        <Form.Control 
                            type="date"                         
                            id="foundDate"
                            name="foundDate"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.foundDate}/>
                        { formik.errors.foundDate ? (<p className='text-danger'> {formik.errors.foundDate} </p>) : null }
                        <br/>
                        <Form.Label>Horas em que achou o objeto: </Form.Label>
                        <Form.Control                        
                            id="foundTime"
                            name="foundTime"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.foundTime}/>
                        { formik.errors.foundTime ? (<p className='text-danger'> {formik.errors.foundTime} </p>) : null }
                        <Form.Text muted>Utilize o formato Horas:Minutos. Se não souber exatamente, estime as horas a que acha que achou o objeto.</Form.Text>
                    </>
                ) : null }

                { naoSabeData ? (
                    <>  
                        <p>Defina um intervalo no qual adimite ter achado o objeto:<span className='text-danger'>*</span> </p>

                        <Form.Label>Começo do intervalo:<span className='text-danger'>*</span> </Form.Label>
                        <Form.Control                                 
                            type="date"                         
                            id="foundDateInfLim"
                            name="foundDateInfLim"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.foundDateInfLim}/>
                        { formik.errors.foundDateInfLim ? (<p className='text-danger'> {formik.errors.foundDateInfLim} </p>) : null } 

                        <Form.Label>Fim do intervalo:<span className='text-danger'>*</span> </Form.Label>
                        <Form.Control                                 
                            type="date"                         
                            id="foundDateSupLim"
                            name="foundDateSupLim"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.foundDateSupLim}/>
                        { formik.errors.foundDateSupLim ? (<p className='text-danger'> {formik.errors.foundDateSupLim} </p>) : null } 
                    </>
                ) : null }

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
            <h4>Informações acerca da localização onde achou o objeto</h4>
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

            <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />

            <p> Se introduzir algum dos campos abaixo, garanta que existe. </p>
                <Form.Label htmlFor="munc">Município: </Form.Label>
                <Form.Control                        
                    id="munc"
                    name="munc"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={getMunicipality()}/>
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
                    value={getAddress()}/>
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
                    value={getPostalCode()}/>
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
                { erroInternoRegistoAchado ? (<p>Erro interno, por favor tente de novo.</p>) : null }
                <Button type="submit"> Criar anúncio </Button>
            </Container>
            </Form>
        </Container>
        )}
        </>
    )
}

export default FormRegistoObjetoAchado;
