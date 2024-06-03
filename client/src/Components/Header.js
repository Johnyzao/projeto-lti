import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import InformacaoLogin from './InformacaoLogin';

function Header() {
  return (
    <>
      <style type="text/css">
        {`
          .custom-navbar {
            background-color: #f8f9fa;
            padding: 10px 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .custom-navbar .navbar-brand {
            font-weight: bold;
            font-size: 1.25rem;
          }

          .custom-navbar .navbar-brand img {
            margin-right: 10px;
          }

          .custom-navbar .navbar-toggler {
            border: none;
          }

          .custom-navbar .navbar-collapse {
            text-align: center;
          }

          .custom-navbar .navbar-collapse .informacao-login {
            margin-top: 10px;
          }

          @media (max-width: 576px) {
            .custom-navbar .navbar-brand {
              font-size: 1rem;
            }
            
            .custom-navbar .navbar-brand img {
              width: 25px;
              height: 25px;
            }
          }
        `}
      </style>
      <Navbar expand="lg" className="bg-body-tertiary custom-navbar">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img
              src="/logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Logo"
            />
            <span className="ms-2">Perdidos e Achados</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <InformacaoLogin />
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
