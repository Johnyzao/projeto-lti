import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import validator from 'validator';
import { useFormik } from 'formik';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import config from '../config';

function EditarLeilao() {
  const { idLeilao } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [auction, setAuction] = useState(null);
  const [sucessoObjetoAchadoAtualizado, setSucessoObjetoAchadoAtualizado] = useState(false);

  useEffect(() => {
    axios.get(`${config.LINK_API}/auction/${idLeilao}`, { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        setAuction(res.data.leilao);
      }).catch(error => {
        console.error("There was an error fetching the auction!", error);
      });
  }, [user]);

  const validate = values => {
    const errors = {};
    if (!values.data_inicio) {
      errors.data_inicio = "Por favor escreva uma data de início.";
    }
    if (!values.data_fim) {
      errors.data_fim = "Por favor escreva uma data de fim.";
    }
    if (!values.valor) {
      errors.valor = "Por favor escreva um valor.";
    }
    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      data_inicio: auction ? new Date(auction.data_inicio).toISOString().substr(0, 10) : '',
      data_fim: auction ? new Date(auction.data_fim).toISOString().substr(0, 10) : '',
      valor: auction ? auction.valor : ''
    },
    validate,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: values => {
      const infoAuctionAEnviar = { 
        idAuction: idLeilao,
        data_inicio: values.data_inicio, 
        data_fim: values.data_fim,
        valor: values.valor
      };
      atualizarAuction(infoAuctionAEnviar);
      setSucessoObjetoAchadoAtualizado(true);
    }
  });

  function atualizarAuction(novaInfoAuction) {
    axios.put(
        config.LINK_API + '/auction',
        {id: idLeilao, data_inicio: novaInfoAuction.data_inicio, data_fim: novaInfoAuction.data_fim, valor: novaInfoAuction.valor},
        { headers: { 'Content-Type': 'application/json' } }
    ).then(res => {
        console.log("Auction updated successfully", res);
    }).catch(error => {
        console.error("There was an error updating the auction!", error);
    });
  }

  function apagarAuction() {
    console.log("Apagar Auction");
  }

  if (!auction) {
    return <div>Loading...</div>;
  }

  return (
    <Container className='bg-light' fluid="sm">
      <h1 className='text-center'> Edição do Leilão </h1>
      <h4> Preencha os campos abaixo se pretende editar a informação do Leilão </h4>
      <Form name='form' onSubmit={formik.handleSubmit}>
        <br/>
        <Form.Group className='border'>
          <Form.Label htmlFor="valor">Valor: </Form.Label>
          <Form.Control
            id="valor"
            name="valor"
            type="number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.valor}
          />
          { formik.errors.valor ? (<p className='text-danger'> {formik.errors.valor} </p>) : null }       

          <br/>
          <Form.Label htmlFor="data_inicio">Data de Início: </Form.Label>
          <Form.Control                         
            id="data_inicio"
            name="data_inicio"
            type="date"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.data_inicio}
          />
          { formik.errors.data_inicio ? (<p className='text-danger'> {formik.errors.data_inicio} </p>) : null } 

          <br/>
          <Form.Label htmlFor="data_fim">Data de Fim: </Form.Label>
          <Form.Control                         
            id="data_fim"
            name="data_fim"
            type="date"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.data_fim}
          />
          { formik.errors.data_fim ? (<p className='text-danger'> {formik.errors.data_fim} </p>) : null } 
        </Form.Group>
        
        <br/>
        <Container className='text-center'>
          { sucessoObjetoAchadoAtualizado ? (<p className='text-success'>Objeto atualizado com sucesso.</p>) : null }
          <br/>
          <Button type="submit"> Atualizar leilão </Button>
          &ensp; 
          &ensp;
          <Button type="button" onClick={apagarAuction}> Apagar </Button>
          </Container>
      </Form>
    </Container>
  );
}

export default EditarLeilao;
