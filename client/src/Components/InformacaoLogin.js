import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import PopupConfirmarLogout from '../Popups/PopupConfirmarLogout';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function InformacaoLogin() {
    const navigate = useNavigate();

    const irParaRegisto = () => {
        localStorage.clear();
        let pathRegisto = "/register";
        navigate(pathRegisto);
    }
    const irParaLogin = () => {
        let pathLogin = "/login";
        navigate(pathLogin);
    }

    let dados = null;
    let logado = localStorage.getItem("dados") !== null;
    
    if (logado) {
        dados = JSON.parse(localStorage.getItem("dados"));
    }

    return (
    <>
    { logado === false ? 
    (
        <>
            <Navbar.Text> <Button onClick={irParaRegisto}> Criar uma conta </Button> </Navbar.Text>
            &ensp;
            &ensp; 
            <Navbar.Text> <Button onClick={irParaLogin}>Log In</Button> </Navbar.Text>
        </>
    ) 
    : 
    ( 
        <>
            <NavDropdown title="Menu" id="basic-nav-dropdown">
                <NavDropdown.Item href="/editUser">Gestão de conta</NavDropdown.Item>
                <NavDropdown.Item href="/editUser">Registar um objeto novo</NavDropdown.Item>
            </NavDropdown>
                &ensp;
                &ensp;
            <Navbar.Text> Logado como: { dados.nome } </Navbar.Text>
                &ensp;
                &ensp;
            <Navbar.Text> <PopupConfirmarLogout/> </Navbar.Text>
        </>
    )}
    </>
    )
}

export default InformacaoLogin;
