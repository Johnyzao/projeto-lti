import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";

import Registo from "./Components/Registo";
import Home from "./Components/Home";
import Login from "./Components/Login";
import EditarUser from './Components/EditarUser';
import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Home/>} />
          <Route path="register" element={<Registo/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="user" element={<EditarUser/>}/>
          <Route path="user/deactivated" element={<ContaDesativada/>}/>
          <Route path="user/deleted" element={<ContaApagada/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;