import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./Components/Home";

import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';
import RegistoComSucesso from './Pages/RegistoComSucesso';
import RegistoNovoUtilizador from './Pages/RegistoNovoUtilizador';
import LoginUtilizador from './Pages/LoginUtilizador';
import PaginaPasswordAlterada from './Pages/PaginaPasswordAlterada';
import GestaoDeConta from './Pages/GestaoDeConta';
import PaginaAdmin from './Pages/PaginaAdmin';
import PaginaObjetoPerdido from './Pages/PaginaNovoObjetoPerdido';
import PaginaObjetoPerdidoSucesso from './Pages/PaginaObjetoPerdidoSucesso';
import PaginaVerObjetosRegistados from './Pages/PaginaVerObjetosRegistados';
import PaginaEditarObjetoPerdido from './Pages/PaginaEditarObjetoPerdido';
import PaginaEditarObjetoAchado from "./Pages/PaginaEditarObjetoAchado";
import PaginaObjetoAchado from './Pages/PaginaObjetoAchado';
import PaginaProcuraObjetosPeridos from './Pages/PaginaProcuraObjetosPerdidos';
import FormProcuraObjetosAchados from './Components/FormProcuraObjetosAchados';
import PaginaProcurarMatches from './Pages/PaginaProcurarMatches';
import CriarLeilao from './Components/CriarLeilao';
import Leiloes from './Components/Leiloes';
import ChatLeilao from './Components/ChatLeilao';
import BidMessage from './Components/BidMessage';

import { useAuth0 } from "@auth0/auth0-react";

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
          <Route path="lostObject/register" element={<PaginaObjetoPerdido/>}/>
          <Route path="lostObject/view" element={<PaginaObjetoPerdido/>}/>
          <Route path="lostObject/register/success" element={<PaginaObjetoPerdidoSucesso/>}/>
          <Route path="lostObject/edit/:idLostObject" element={<PaginaEditarObjetoPerdido/>} />
          <Route path="objects/list" element={<PaginaVerObjetosRegistados/>} />
          <Route path="foundObject/register" element={<PaginaObjetoAchado/>} />
          <Route path="foundObject/register/success" element={<PaginaObjetoPerdidoSucesso/>}/>
          <Route path="foundObject/edit/:idLostObject" element={<PaginaEditarObjetoAchado/>} />
          <Route path="search" element={<PaginaProcuraObjetosPeridos/>} />
          <Route path="lostObject/getMatches" element={<PaginaProcurarMatches/>} />
          <Route path="/auction/register" element={<CriarLeilao/>} />
          <Route path="/auction/Leiloes" element={<Leiloes/>} />
          <Route path="/auction/Leiloes/ChatLeilao" element={<ChatLeilao/>} />
          <Route path="/auction/Leiloes/BidMessage" element={<BidMessage/>} />

  
        </Routes>
    </BrowserRouter>
    </>
  );
}