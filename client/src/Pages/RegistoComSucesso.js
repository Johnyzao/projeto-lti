import React from 'react';
import { Link } from "react-router-dom";

function RegistoComSucesso() {
  return (
    <div>
      <p> A sua conta foi registada com sucesso. </p>
      <p> <Link to="/login">Clique aqui</Link> para efetuar login. </p>
    </div>
  )
}

export default RegistoComSucesso;
