import React, { useState, useEffect } from 'react';

// Informacoes da API.
import config from '../config';

// https://axios-http.com/docs/res_schema 
import axios from 'axios';

import Table from 'react-bootstrap/Table';

function TabelaPostos() {

    const [postos, setPostos] = useState({});

    async function obterPostos() {
        await axios.get(
            config.LINK_API + "/allPoliceStations",
        ).then( ( res ) => {

            if ( res.status === 200 ) {
                setPostos(res.data);
            }

        }).catch( function (error) {
            if ( error.response ) {
                let codigo = error.response.status;

                if ( codigo === 500 ) {
 
                }
            }
        });
    }

    useEffect( () => { obterPostos() }, [] );
    return (
        <>  
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>ID do Posto</th>
                            <th>Código Postal</th>
                            <th>Morada</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            // TODO: Escrever as linhas da tabela.
                        }
                        <tr>
                            <td>1</td>
                            <td>Mark</td>
                            <td>Otto</td>
                        </tr>
                    </tbody>
                </table>    
            </div>
        </>
    )
}

export default TabelaPostos;
