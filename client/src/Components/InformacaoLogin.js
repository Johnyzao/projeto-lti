import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import PopupConfirmarLogout from '../Popups/PopupConfirmarLogout';
import { Link } from 'react-router-dom';

function InformacaoLogin() {

    let dados = JSON.parse( localStorage.getItem("dados") );
    let nomeUser = (dados === null) ? null : dados.nome;

    // TODO: Ver ícones
    return (
    <>
    { nomeUser === null ? 
    (
        <>
            <Navbar.Text> <Link to="/register"> Registar </Link> </Navbar.Text>
            &ensp;
            &ensp; 
            <Navbar.Text> <Link to="/login"> Login </Link> </Navbar.Text>
        </>
    ) 
    : 
    ( 
        <>
            <NavDropdown title="Menu" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/user">Gestão de conta</NavDropdown.Item>
                    <NavDropdown.Item href="/user">Registar um objeto novo</NavDropdown.Item>
            </NavDropdown>
                &ensp;
                &ensp;
            <Navbar.Text> Logado como: { nomeUser } </Navbar.Text>
                &ensp;
                &ensp;
            <Navbar.Text> <PopupConfirmarLogout/> </Navbar.Text>
        </>
    )}
    </>
    )
}

export default InformacaoLogin;
