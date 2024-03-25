import React from 'react';
<<<<<<< HEAD
import { Route, BrowserRouter, Routes } from "react-router-dom";

import Registo from "./Components/Registo";
import Home from "./Components/Home";
import Login from "./Components/Login";
import EditarUser from './Components/EditarUser';
import ContaDesativada from './Pages/ContaDesativada';
import ContaApagada from './Pages/ContaApagada';
=======
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Home from './Components/Home';
import Login from './Components/Login';
import Registo from './Components/Registo';
>>>>>>> 52e1e896e1c0b1fe4cee0686b18798eaf09e83bf

function App() {
  return (
<<<<<<< HEAD
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
=======
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registo" element={<Registo />} />
      </Routes>
    </Router>
>>>>>>> 52e1e896e1c0b1fe4cee0686b18798eaf09e83bf
  );
}

export default App;