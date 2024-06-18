import React, { useState,useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.css';

import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import FormPolicia from '../Components/FormPolicia';
import FormPosto from '../Components/FormPosto';
import Header from '../Components/Header';
import AdminGestaoUsers from '../Components/AdminGestaoUsers';
import FormCategorias from '../Components/FormCategorias';
import AdminGestaoPosse from '../Components/AdminGestaoPosse';

function PaginaAdmin() {

    const [paginaEscolhida, setPaginaEscolhida] = useState("users");

    return (
    <>
        <Header/>
        <Nav variant='tabs'>
            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("users")}}>Users</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("police")}}>Polícias</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("categories")}}>Categorias</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("recs")}}>Pedidos de posse</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link onClick={() => {setPaginaEscolhida("posse")}}>Posse de objetos</Nav.Link>
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

        { paginaEscolhida === "categories" 
            ? (<div className='container-sm bg-dark-subtle'> <FormCategorias/> </div>) 
            : null 
        }

        { paginaEscolhida === "recs" 
            ? (<AdminGestaoPosse/>) 
            : null
        }

        { paginaEscolhida === "posse" 
            ? <p>futura página aqui</p> 
            : null 
        }

    </>
    )
}

export default PaginaAdmin;
