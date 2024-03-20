import React from 'react';
import { Link } from 'react-router-dom';


function ContaDesativada() {
  return (
    <div>
        <h1>Conta desativada</h1>
        <p>A sua conta foi desativada.</p>
        <p>Esta ação não é permanente, e pode reativar a sua conta a qualquer momento.</p>
        <p>Para reativar a sua conta basta ir à página "Gestão de conta" e clicar no botão ativar conta.</p>
        <p> <Link to="/">Clique aqui</Link> para ir para a homepage.</p>
    </div>
  )
}

export default ContaDesativada;
