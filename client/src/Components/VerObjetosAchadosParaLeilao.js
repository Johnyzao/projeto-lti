import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Button from 'react-bootstrap/Button';

function VerObjetosAchadosParaLeilao({ nif, onSelect }) {
    const [objetosAchados, setObjetosAchados] = useState([]);
    const [selectedObjectId, setSelectedObjectId] = useState(null);

    useEffect(() => {
        axios.get(`${config.LINK_API}/foundObject/user/${nif}`)
            .then(response => {
                setObjetosAchados(response.data.objAchados);
            })
            .catch(error => {
                console.error('Erro ao carregar objetos achados:', error);
            });
    }, [nif]);

    const handleSelect = (id) => {
        setSelectedObjectId(id);
        onSelect(id); // Passa o ID do objeto selecionado para o componente pai
    };

    return (
        <div>
        {objetosAchados.map(objeto => (
            <div key={objeto.id} className="list-group-item d-flex align-items-center">
                <div>
                    <h5>{objeto.titulo}</h5>
                    <p>{objeto.descricao}</p>
                </div>
                <div className="ml-auto">
                    <Button 
                        onClick={() => handleSelect(objeto.id)} 
                        style={{
                            width: '100%', // Garante que os botões tenham o mesmo tamanho
                            background: selectedObjectId === objeto.id ? 'green' : 'blue', 
                            borderColor: selectedObjectId === objeto.id ? 'green' : 'blue'
                        }}
                    >
                        {selectedObjectId === objeto.id ? 'Selecionado' : 'Leiloar'}
                    </Button>
                </div>
            </div>
        ))}
        </div>
    );
}

export default VerObjetosAchadosParaLeilao;
