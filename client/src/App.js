import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Home from './Components/Home';
import Login from './Components/Login';
import Registo from './Components/Registo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registo" element={<Registo />} />
      </Routes>
    </Router>
  );
}

export default App;