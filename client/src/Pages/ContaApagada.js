import React from 'react';
import { Link } from 'react-router-dom';


function ContaDesativada() {
  return (
    <div>
        <h1>A sua conta foi apagada com sucesso</h1>
        <p> <Link to="/home">Clique aqui</Link> para ir para a homepage.</p>
    </div>
  )
}

export default ContaDesativada;
