import React from 'react';

import FormPolicia from '../Components/FormPolicia';
import FormPosto from '../Components/FormPosto';
import TabelaPostos from '../Components/TabelaPostos';

function PaginaAdmin() {
    return (
    <>
        <div>
            <FormPolicia/>
        </div>

        <br/>

        <div>
            <FormPosto/>
        </div>

        <br/>

        <div>
            <TabelaPostos/>
        </div>
    </>
    )
}

export default PaginaAdmin;
