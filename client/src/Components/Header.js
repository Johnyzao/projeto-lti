import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import InformacaoLogin from './InformacaoLogin';

function Header() {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">Perdidos e Achados</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
            <InformacaoLogin/>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header;
