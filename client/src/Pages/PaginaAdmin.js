import React from 'react';

import FormPolicia from '../Components/FormPolicia';
import FormPosto from '../Components/FormPosto';
import TabelaPostos from '../Components/TabelaPostos';
import TabelaPolicias from '../Components/TabelaPolicias';

function PaginaAdmin() {
    return (
    <>
        <div className='container-sm bg-dark-subtle'>
            <FormPolicia/>
        </div>

        <br/>

        <div className='container-sm bg-dark-subtle'>
            <FormPosto/>
        </div>
        <br/>
    </>
    )
}

export default PaginaAdmin;
