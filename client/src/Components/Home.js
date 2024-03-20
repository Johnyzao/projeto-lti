import React, { Component } from 'react';
import Header from './Header';

export class Home extends Component {
  render() {
    return (
      <>
        <Header/>
        <div>
          <p>Esta é a página principal.</p>
        </div>
      </>
    )
  }
}

export default Home
