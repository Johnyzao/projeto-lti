import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./Components/Home";
import EditarUser from './Components/EditarUser';
import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';
import RegistoComSucesso from './Pages/RegistoComSucesso';
import RegistoNovoUtilizador from './Pages/RegistoNovoUtilizador';
import LoginUtilizador from './Pages/LoginUtilizador';

function App() {
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route index path="/home" element={<Home/>} />
          <Route path="register/success" element={<RegistoComSucesso/>}/>
          <Route path="register" element={<RegistoNovoUtilizador/>}/>
          <Route path="login" element={<LoginUtilizador/>}/>
          <Route path="user" element={<EditarUser/>}/>
          <Route path="user/deactivated" element={<ContaDesativada/>}/>
          <Route path="user/deleted" element={<ContaApagada/>}/>
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;