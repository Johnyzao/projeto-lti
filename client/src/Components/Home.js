import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
  render() {
    return (
      <div>
        <p>Esta é a página principal.</p>
        <Link to="./Login"><button>Login</button></Link>
        <Link to="./Registo"><button>Register</button></Link>
       
      </div>
    );
  }
}

export default Home;
