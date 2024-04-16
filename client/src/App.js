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

function App() {
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route index path="/home" element={<Home/>} />
          <Route path="register/success" element={<RegistoComSucesso/>}/>
          <Route path="register" element={<RegistoNovoUtilizador/>}/>
          <Route path="login" element={<LoginUtilizador/>}/>
          <Route path="editUser" element={<GestaoDeConta/>}/>
          <Route path="accountDeactivated" element={<ContaDesativada/>}/>
          <Route path="accountDeleted" element={<ContaApagada/>}/>
          <Route path="user/passwordChange" element={<PaginaPasswordAlterada/>} />
          <Route path="admin/police" element={<PaginaAdmin/>} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;