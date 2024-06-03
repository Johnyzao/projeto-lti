import React from 'react';


function TabelaCategorias(props) {
    return (
        <>
            <tr>
                <td>{props.nomecat}</td>
                <td>{props.atr}</td>
                <td>{props.vlr}</td>
            </tr>
        </>
    )
}

export default TabelaCategorias;
