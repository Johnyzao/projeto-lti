import React, { useState,useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.css';

import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import FormPolicia from '../Components/FormPolicia';
import FormPosto from '../Components/FormPosto';
import Header from '../Components/Header';
import AdminGestaoUsers from '../Components/AdminGestaoUsers';
import FormCategorias from '../Components/FormCategorias';

function PaginaAdmin() {

    const [paginaEscolhida, setPaginaEscolhida] = useState("users");

    return (
    <>
        <Header/>
        <Nav variant='tabs'>
            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("users")}} href="#">Gestão de utilizadores</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("police")}} href="#">Gestão de polícias</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("categories")}}>Gestão de categorias</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link disabled href="#">Gestão de objetos</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link disabled href="#">Gestão de leilões</Nav.Link>
            </Nav.Item>
        </Nav>
        <br/>

        { paginaEscolhida === "users" 
            ? (<div className='container-sm bg-dark-subtle'> <AdminGestaoUsers/> </div>) 
            : null
        }

        { paginaEscolhida === "police" 
            ? (
                <div>
                    <div className='container-sm bg-dark-subtle'>
                        <FormPolicia/>
                    </div>

                    <br/>

                    <div className='container-sm bg-dark-subtle'>
                        <FormPosto/>
                    </div>
                </div>
            ) 
            : null
        }

        { paginaEscolhida === "categories" ? (<div className='container-sm bg-dark-subtle'> <FormCategorias/> </div>) : null }



    </>
    )
}

export default PaginaAdmin;
