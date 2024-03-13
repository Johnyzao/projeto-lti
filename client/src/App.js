import React from 'react';
import { Route, BrowserRouter, Routes } from "react-router-dom";

import Registo from "./Components/Registo";
import Home from "./Components/Home";
import Login from "./Components/Login";
import EditarUser from './Components/EditarUser';

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Home/>}/>
          <Route path="/register" element={<Registo/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/editUser" element={<EditarUser/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;