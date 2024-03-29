import React, { Component } from 'react';
<<<<<<< HEAD
import Header from './Header';
=======
import { Link } from 'react-router-dom';
>>>>>>> 52e1e896e1c0b1fe4cee0686b18798eaf09e83bf

class Home extends Component {
  render() {
    return (
<<<<<<< HEAD
      <>
        <Header/>
        <div>
          <p>Esta é a página principal.</p>
        </div>
      </>
    )
=======
      <div>
        <p>Esta é a página principal.</p>
        <Link to="./Login"><button>Login</button></Link>
        <Link to="./Registo"><button>Register</button></Link>
       
      </div>
    );
>>>>>>> 52e1e896e1c0b1fe4cee0686b18798eaf09e83bf
  }
}

export default Home;
