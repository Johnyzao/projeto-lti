import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import PopupConfirmarLogout from '../Popups/PopupConfirmarLogout';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

import { useAuth0 } from "@auth0/auth0-react";

function InformacaoLogin() {
    const navigate = useNavigate();

    const irParaRegisto = () => {
        localStorage.clear();
        let pathRegisto = "/register";
        navigate(pathRegisto);
    }

    const { loginWithRedirect } = useAuth0();
    const { user, isAuthenticated, logout } = useAuth0();

    return (
    <>
    { isAuthenticated === false ? 
    (
        <>
            <Navbar.Text> <Button onClick={irParaRegisto}> Criar uma conta </Button> </Navbar.Text>
            &ensp;
            &ensp; 
            <Navbar.Text> <Button onClick={() => {loginWithRedirect()}}>Log In</Button> </Navbar.Text>
        </>
    ) 
    : 
    ( 
        <>
            <NavDropdown title="Menu" id="basic-nav-dropdown">
                <NavDropdown.Item href="/editUser">Gestão de conta</NavDropdown.Item>
                <NavDropdown.Item href="/objects/list">Ver objetos registados</NavDropdown.Item>
                <NavDropdown.Item href="/lostObject/register">Registar um Objeto Perdido</NavDropdown.Item>
                <NavDropdown.Item href="/foundObject/register">Registar um Objeto Achado</NavDropdown.Item>
                { "a" === "a" 
                    ? (<NavDropdown.Item href="/admin">Página de administração</NavDropdown.Item>) 
                    : null
                }
            </NavDropdown>
                &ensp;
                &ensp;
            <Navbar.Text> Logado como: { user.nickname } </Navbar.Text>
                &ensp;
                &ensp;
            <Navbar.Text> <PopupConfirmarLogout/> </Navbar.Text>
        </>
    )}
    </>
    )
}

export default InformacaoLogin;
