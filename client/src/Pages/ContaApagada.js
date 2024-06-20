import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth0 } from "@auth0/auth0-react";

function ContaDesativada() {

  const {logout} = useAuth0();

  logout();
  return (
    <div>
        <h1>A sua conta foi apagada com sucesso</h1>
        <p> <Link to="/home">Clique aqui</Link> para ir para a homepage.</p>
    </div>
  )
}

export default ContaDesativada;
