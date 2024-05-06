import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./Components/Home";

import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';
import RegistoComSucesso from './Pages/RegistoComSucesso';
import RegistoNovoUtilizador from './Pages/RegistoNovoUtilizador';
import LoginUtilizador from './Pages/LoginUtilizador';
import PaginaEditarUser from './Pages/PaginaEditarUser';
import PaginaPasswordAlterada from './Pages/PaginaPasswordAlterada';
import GestaoDeConta from './Pages/GestaoDeConta';
import PaginaAdmin from './Pages/PaginaAdmin';
import FormObjetoPerdido from './Components/FormObjetoPerdido';
import PaginaObjetoPerdido from './Pages/PaginaNovoObjetoPerdido';
import PaginaObjetoPerdidoSucesso from './Pages/PaginaObjetoPerdidoSucesso';
import VerObjetos from './Components/VerObjetos';
import FormEditarObjetoPerdido from './Components/FormEditarObjetoPerdido';
import PaginaVerObjetosRegistados from './Pages/PaginaVerObjetosRegistados';

function App() {
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Home/>} />
          <Route path="register/success" element={<RegistoComSucesso/>}/>
          <Route path="register" element={<RegistoNovoUtilizador/>}/>
          <Route path="login" element={<LoginUtilizador/>}/>
          <Route path="editUser" element={<GestaoDeConta/>}/>
          <Route path="accountDeactivated" element={<ContaDesativada/>}/>
          <Route path="accountDeleted" element={<ContaApagada/>}/>
          <Route path="user/passwordChange" element={<PaginaPasswordAlterada/>} />
          <Route path="admin" element={<PaginaAdmin/>} />
          <Route path="register/lostObject" element={<FormObjetoPerdido/>} />
          <Route path="lostObject/register" element={<PaginaObjetoPerdido/>}/>
          <Route path="lostObject/view" element={<PaginaObjetoPerdido/>}/>
          <Route path="lostObject/register/success" element={<PaginaObjetoPerdidoSucesso/>}/>
          <Route path="objects/list" element={<PaginaVerObjetosRegistados/>} />
          <Route path="teste" element={<FormEditarObjetoPerdido/>} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;