import React from 'react';
import Container from 'react-bootstrap/Container';
import Header from "../Components/Header";

function PaginaObjetoPerdidoSucesso() {
  return (
    <>
      <Header/>
      <br/>
      <Container className='bg-light justify-content-center' fluid="sm">
          <p>O seu objeto foi registado com sucesso.</p>
          <p> <a href="/">Clique aqui</a> para voltar para a página principal.</p>
      </Container>
    </>
  );
}

export default PaginaObjetoPerdidoSucesso;
