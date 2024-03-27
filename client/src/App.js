import logo from './Components/Images/logo.png';
import React from 'react';
import './Components/CSS/App.css';
import Dropdown from 'react-bootstrap/Dropdown';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';


function App() {
  return (
    <div className="grid-container">
      <div className="item0"><img src={logo} className="App-logo" alt="logo" /></div>
      <div className="item1">Lost & Found</div>
      <div className="item2">
      <a href="/">Home</a>
      <Dropdown className="d-inline mx-2">
        <Dropdown.Toggle id="dropdown-autoclose-true">
         Login/Register
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="/login">Login</Dropdown.Item>
          <Dropdown.Item href="/register">Register</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="d-inline mx-2">
        <Dropdown.Toggle id="dropdown-autoclose-true">
         About Us
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="/login">About Us</Dropdown.Item>
          <Dropdown.Item href="/register">Contacts</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      </div>
      <div className="item3"> Main </div>
      <div className="item4"> @copyrights </div>




      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
