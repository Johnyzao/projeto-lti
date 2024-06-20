import { React, useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useFormik } from 'formik';
import Form from 'react-bootstrap/Form';
import validator from 'validator';

// https://www.npmjs.com/package/react-password-strength-bar
import axios from 'axios';

// Informacoes da API.
import config from '../config';

function PopupEditarPosto(props) {

    const {codpostal, id, localidade, morada, removido, telefone} = props.posto;
    const [localidadeNova, setLocalidadeNova] = useState(localidade);

    const [alteracaoPostoSucesso, setAlteracaoPostoSucesso] = useState(false);
    const [alteracaoPostoInsucesso, setAlteracaoPostoInsucesso] = useState(false);
    /* 
    JSON do props.posto:
        codpostal: "2745-338"
        id:1
        localidade:"Lisboa"
        morada:"Rua lol"
        removido:0
        telefone:"218111000"
    */

    async function atualizarPosto(infoPosto) {
        await axios.put(
            config.LINK_API + "/policeStation",
            infoPosto
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                setAlteracaoPostoSucesso(true);
                setTimeout(() => {
                    setAlteracaoPostoSucesso(false);
                }, 5000);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
                    setAlteracaoPostoInsucesso(true);
                    setTimeout(() => {
                        setAlteracaoPostoInsucesso(false);
                    }, 5000);
                }
            }
        });
    }

    const validate = values => {
        const errors = {};

        values.codpNovo !== "" 
            ? delete errors.codpNovo 
            : errors.codp = "Por favor escreva um código postal.";

        validator.isPostalCode(values.codpNovo, "PT")
            ? delete errors.codpNovo 
            : errors.codpNovo = "Por favor escreva um código postal válido.";

        values.moradaNova !== "" 
            ? delete errors.moradaNova 
            : errors.moradaNova = "Por favor escreva uma morada.";

        validator.isMobilePhone( values.telefoneNovo, "pt-PT" )
            ? errors.telefoneNovo = "Número de telemóvel incorreto."
            : delete errors.telefoneNovo;

        console.table(errors);
        return errors;
    }

    const formik = useFormik({
        initialValues: {
            codpNovo: codpostal,
            moradaNova: morada,
            telefoneNovo: telefone
        },
        validate,
        onSubmit: values => {
            let valoresPosto = {id: id, codp: values.codpNovo, morada: values.moradaNova, localidade: localidadeNova, telefone: values.telefoneNovo};
            atualizarPosto(valoresPosto);
        },
    });

    function desenharBotao(estado) {
        if ( estado === 1 ) {
            return (<Button className="btn btn-primary" disabled> Editar posto </Button>);
        } else {
            return (<Button className="btn btn-primary"> Editar posto </Button>);
        }

    }

    return (
      <Popup trigger={desenharBotao(removido)} modal>
        {close => (
          <div
            className="modal show"
            style={{ display: 'block', position: 'initial' }}
          >
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>Edição do Posto</Modal.Title>
                <Button variant='danger' onClick={close}>
                  &times;
                </Button>
              </Modal.Header>

              <Modal.Body>
                <Form onSubmit={formik.handleSubmit}>
                <Form.Label htmlFor="codpNovo">Código postal do Posto:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="codpNovo"
                        name="codpNovo"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.codpNovo}
                    />
                <Form.Text className="text-muted">
                    Um código postal tem o formato: XXXX-XXX.
                </Form.Text>
                { formik.errors.codpNovo ? (<p className='text-danger'> {formik.errors.codpNovo} </p>) : null }

                <Form.Label htmlFor="moradaNova">Morada do Posto:<span className='text-danger'>*</span>  </Form.Label>
                    <Form.Control
                        id="moradaNova"
                        name="moradaNova"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.moradaNova}
                    />    
                { formik.errors.moradaNova ? (<p className='text-danger'> {formik.errors.moradaNova} </p>) : null }

                <Form.Label>Localidade: </Form.Label>
                    <Form.Select as="select"
                        size="lg"
                        id="localidade"
                        name="localidade"
                        onChange={(e) => {setLocalidadeNova(e.target.value)}}>
                            <option selected={localidadeNova==="Aveiro" ? true : false} values="Aveiro">Aveiro</option>
                            <option selected={localidadeNova==="Beja"  ? true : false} values="Beja">Beja</option>
                            <option selected={localidadeNova==="Braga" ? true : false}  values="Braga">Braga</option>
                            <option selected={localidadeNova==="Bracanca" ? true : false}  values="Bracanca">Bragança</option>
                            <option selected={localidadeNova==="Castelo Branco" ? true : false}  values="Castelo Branco">Castelo Branco</option>
                            <option selected={localidadeNova==="Coimbra" ? true : false}  values="Coimbra">Coimbra</option>
                            <option selected={localidadeNova==="Evora" ? true : false}  values="Evora">Évora</option>
                            <option selected={localidadeNova==="Faro" ? true : false}  values="Faro">Faro</option>
                            <option selected={localidadeNova==="Guarda" ? true : false}  values="Guarda">Guarda</option>
                            <option selected={localidadeNova==="Leiria" ? true : false}  values="Leiria">Leiria</option>
                            <option selected={localidadeNova==="Lisboa" ? true : false}  values="Lisboa">Lisboa</option>
                            <option selected={localidadeNova==="Portalegre" ? true : false}  values="Portalegre">Portalegre</option>
                            <option selected={localidadeNova==="Porto" ? true : false}  values="Porto">Porto</option>
                            <option selected={localidadeNova==="Santarem" ? true : false}  values="Santarem">Santarém</option>
                            <option selected={localidadeNova==="Setubal" ? true : false}  values="Setubal">Setúbal</option>
                            <option selected={localidadeNova==="Viana do Castelo" ? true : false}  values="Viana do Castelo">Viana do Castelo</option>
                            <option selected={localidadeNova==="Vila Real" ? true : false}  values="Vila Real">Vila Real</option>
                            <option selected={localidadeNova==="Viseu" ? true : false}  values="Viseu">Viseu</option>
                    </Form.Select>

                    <Form.Label htmlFor="telefone">Telefone:<span className='text-danger'>*</span>  </Form.Label>
                        <Form.Control
                            id="telefoneNovo"
                            name="telefoneNovo"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.telefoneNovo}
                        />    
                    { formik.errors.telefoneNovo ? (<p className='text-danger'> {formik.errors.telefoneNovo} </p>) : null }  

                </Form>

                { alteracaoPostoSucesso ? <p className='text-success' >Posto alterado com sucesso.</p> : null }
                { alteracaoPostoInsucesso ? <p className='text-danger' >Erro interno, por favor tente de novo.</p> : null }

              </Modal.Body>

              <Modal.Footer>
                <Button onClick={close} variant="danger">Cancelar</Button>
                <Button onClick={formik.handleSubmit} variant="success">Confirmar alterações</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}
      </Popup>
    )
}

export default PopupEditarPosto
