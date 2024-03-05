import React from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Registo from "./Components/Registo";
import Login from './Components/Login';

// PÃ¡gina para as Routes.
// https://www.w3schools.com/react/react_router.asp

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="register" element={<Registo/>}/> 
          <Route path="login" element={<Login/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;