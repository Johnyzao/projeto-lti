import React from 'react';
import { useParams } from "react-router-dom";

import Header from '../Components/Header';
import FormEditarObjetoPerdido from '../Components/FormEditarObjetoPerdido';

function PaginaEditarObjetoPerdido() {

    let { idLostObject } = useParams();
    console.log(idLostObject);

    return (
        <>
            <Header/>
            <FormEditarObjetoPerdido id={idLostObject}/>
        </>
    )
}

export default PaginaEditarObjetoPerdido
