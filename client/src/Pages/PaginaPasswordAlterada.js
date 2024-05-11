import React from 'react';
import { Link } from "react-router-dom";
import Header from "../Components/Header.js";

function PaginaPasswordAlterada() {
  return (
    <>
        <Header/>
        <div>
            <p>A sua palavra pass foi alterada com sucesso, por favor volte a fazer login de novo.</p>
            <p> <Link to="/login">Clique aqui</Link> para efetuar login de novo. </p>
        </div>
    </>
  )
}

export default PaginaPasswordAlterada;
