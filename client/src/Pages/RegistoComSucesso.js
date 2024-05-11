import React from 'react';
import { Link } from "react-router-dom";

import Header from '../Components/Header';
import Container from 'react-bootstrap/esm/Container';

function RegistoComSucesso() {
  return (
    <>
      <Header/>
      <Container color='red'>
          <p> A sua conta foi registada com sucesso. </p>
          <p> <Link to="/login">Clique aqui</Link> para efetuar login. </p>
      </Container>
    </>
  )
}

export default RegistoComSucesso;
