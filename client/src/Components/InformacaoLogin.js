import React, { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import PopupConfirmarLogout from '../Popups/PopupConfirmarLogout';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

import { useAuth0 } from "@auth0/auth0-react";

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

function InformacaoLogin() {
    const navigate = useNavigate();
    const { loginWithRedirect } = useAuth0();
    const { user, isAuthenticated } = useAuth0();
    const [ tipoConta, setTipoConta ] = useState("");

    const irParaRegisto = () => {
        localStorage.clear();
        let pathRegisto = "/register";
        navigate(pathRegisto);
    }

    async function obterPaginaAdmin(user){
        if (user !== undefined) {
            await axios.get(
                config.LINK_API + "/user/" + user.sub.split("|")[1],
                { headers: {'Content-Type': 'application/json'}},
                ).then ( (res) => {
                if (res.status === 200) {
                    setTipoConta( res.data.tipo_conta );
                } 
            }).catch(function (error) {
                if ( error.response ) {
                    let codigo = error.response.status;

                    if ( codigo === 404 ) {
                        setTipoConta("");
                    }
                }
            })
        }
    }

    // TODO:
    //  - Atualizar info no Auth0 quando é enviada do editar user;
    //  - Criar users de policias no Auth0;

    useEffect( () => { obterPaginaAdmin(user) }, [user] );
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
                { tipoConta === "a" 
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
