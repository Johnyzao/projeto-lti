import React, { useState} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import VerObjetosAchadosParaLeilao from './VerObjetosAchadosParaLeilao';

function CriarLeilao() {
    const [state, setState] = useState({
        startingPrice: 0,
        selectedObjectId: '', // Campo para armazenar o ID do objeto selecionado
        success: false
    });

    const handleInputChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const handleObjectSelect = (id) => {
        setState({
            ...state,
            selectedObjectId: id
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const auctionData = {
            startingPrice: state.startingPrice,
            endDate: state.endDate,
            selectedObjectId: state.selectedObjectId // Passar o ID do objeto selecionado para o backend
        };

        axios.post('/api/criar-leilao', auctionData)
            .then(response => {
                console.log('Novo leilão criado:', response.data);
                setState({
                    startingPrice: 0,
                    selectedObjectId: '',
                    success: true // Define sucesso como verdadeiro após a criação do leilão
                });
            })
            .catch(error => {
                console.error('Erro ao criar leilão:', error);
            });
    };

    return (
        <>
            <Header />
            <div className='item3' style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
                <h1 style={{ textAlign: 'center' }}>Criar Novo Leilão</h1>
                <br />
                <form onSubmit={handleSubmit}>
                    <Container className='bg-light' fluid='sm'>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Objetos Achados registados</Accordion.Header>
                                <Accordion.Body>
                                    <VerObjetosAchadosParaLeilao nif={JSON.parse(localStorage.getItem("dados")).nif} onSelect={handleObjectSelect} />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Container>
                    <br />
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        Preço Inicial:
                        <input
                            type="number"
                            name="startingPrice"
                            value={state.startingPrice}
                            onChange={handleInputChange}
                            step="0.01" // Permitir valores decimais
                            required
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </label>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'blue',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Criar
                    </button>
                </form>
                {state.success && (
                    <div className="success-message" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p>Leilão Criado com Sucesso </p>
                        <p><Link to="/" style={{ color: 'blue' }}>Clique Aqui</Link> para voltar à página principal.</p>
                        <p>Ou <Link to="/leiloes">Clique Aqui</Link> para ver os leilões ativos.</p>
                    </div>
                )}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    {state.selectedObjectId ? (
                        <span style={{ color: 'green' }}>Objeto Selecionado</span>
                    ) : (
                        <span style={{ color: 'red' }}>Nenhum Objeto Selecionado</span>
                    )}
                </div>
            </div>
        </>
    );
}

export default CriarLeilao;
