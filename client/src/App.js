import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";

import AuthProvider from 'react-auth-kit/AuthProvider';

//https://authkit.arkadip.dev/reference/react-auth-kit/createStore/#type-parameters
import createStore from 'react-auth-kit/createStore';

// meter cookieScure = true quando tivermos TLS.

import Home from "./Components/Home";
import EditarUser from './Components/EditarUser';
import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';
import RegistoComSucesso from './Pages/RegistoComSucesso';
import RegistoNovoUtilizador from './Pages/RegistoNovoUtilizador';
import LoginUtilizador from './Pages/LoginUtilizador';

function App() {

  const store = createStore({
    authName:'_auth',
    authType:'cookie',
    cookieDomain: window.location.hostname,
    cookieSecure: false
   })

  return (
    <>
    <BrowserRouter>
      <AuthProvider store={store}>
        <Routes>
          <Route index path="/" element={<Home/>} />
          <Route path="register/success" element={<RegistoComSucesso/>}/>
          <Route path="register" element={<RegistoNovoUtilizador/>}/>
          <Route path="login" element={<LoginUtilizador/>}/>
          <Route path="user" element={<EditarUser/>}/>
          <Route path="user/deactivated" element={<ContaDesativada/>}/>
          <Route path="user/deleted" element={<ContaApagada/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </>
  );
}

export default App;