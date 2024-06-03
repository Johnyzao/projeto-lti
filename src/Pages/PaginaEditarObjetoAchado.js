import React from 'react';
import { useParams } from "react-router-dom";

import Header from '../Components/Header';
import FormEditarObjetoAchado from '../Components/FormEditarObjetoAchado';

function PaginaEditarObjetoAchado() {

    let { idLostObject } = useParams();

    return (
        <>
            <Header/>
            <FormEditarObjetoAchado id={idLostObject}/>
        </>
    )
}

export default PaginaEditarObjetoAchado;
