import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import config from '../config';

function CriarLeilao() {
    const [state, setState] = useState({
        startingPrice: 0,
        selectedObjectId: '',
        success: false,
        startDate: '',
        endDate: ''
    });

    const [objetosAchados, setObjetosAchados] = useState([]);
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get(`${config.LINK_API}/foundObject/user/${JSON.parse(localStorage.getItem("dados")).nif}`)
            .then(response => {
                setObjetosAchados(response.data.objAchados);
            })
            .catch(error => {
                console.error('Erro ao carregar objetos achados:', error);
            });
    }, []);

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
        setSelectedObjectId(id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const auctionData = {
            startingPrice: parseFloat(state.startingPrice),
            selectedObjectId: state.selectedObjectId,
            startDate: state.startDate,
            endDate: state.endDate
        };

        axios.post(config.LINK_API + '/auction', auctionData)
            .then(response => {
                console.log('Novo leilão criado:', response.data);
                setState({
                    ...state,
                    success: true
                });
            })
            .catch(error => {
                console.error('Erro ao criar leilão:', error);
            });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredObjects = objetosAchados.filter(objeto =>
        objeto.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isFormValid = () => {
        return state.startingPrice !== 0 &&
            state.selectedObjectId !== '' &&
            state.startDate !== '' &&
            state.endDate !== '';
    };

    return (
        <>
            <Header />
            <Container style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
                <h1 style={{ textAlign: 'center' }}>Criar Novo Leilão</h1>
                <br />
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6} className='bg-light rounded p-4'>
                            <h5 className='mb-3'>Objetos Não Reclamados</h5>
                            <Form.Group controlId="formSearch">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Pesquisar objetos..." 
                                    value={searchTerm} 
                                    onChange={handleSearchChange} 
                                    className='mb-3'
                                />
                            </Form.Group>
                            {filteredObjects.length > 0 ? (
                                <ul className="list-group" style={{ padding: 0 }}>
                                    {filteredObjects.map(objeto => (
                                        <li key={objeto.id} className="list-group-item d-flex justify-content-between align-items-center mb-3 p-3 rounded" style={{ border: '1px solid #ddd' }}>
                                            <div>
                                                <h5 className='mb-0'>{objeto.titulo}</h5>
                                                <p className='mb-0'>{objeto.descricao}</p>
                                            </div>
                                            <Button
                                                onClick={() => handleObjectSelect(objeto.id)}
                                                className={`btn ${selectedObjectId === objeto.id ? 'btn-success' : 'btn-primary'} px-4 py-2`}
                                            >
                                                {selectedObjectId === objeto.id ? 'Selecionado' : 'Selecionar'}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhum objeto encontrado.</p>
                            )}
                        </Col>
                        <Col md={1}></Col>
                        <Col md={5} className='bg-light rounded p-4'>
                            <label className='mb-3' style={{ width: 'calc(100% - 1.5rem)' }}>
                                Preço Inicial:
                                <input
                                    type="number"
                                    name="startingPrice"
                                    value={state.startingPrice}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                    className='form-control'
                                />
                            </label>
                            <label className='mb-3' style={{ width: 'calc(100% - 1.5rem)' }}>
                                Data e Hora de Início:
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={state.startDate}
                                    onChange={handleInputChange}
                                    required
                                    className='form-control'
                                />
                            </label>
                            <label className='mb-3' style={{ width: 'calc(100% - 1.5rem)' }}>
                                Data e Hora de Fim:
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={state.endDate}
                                    onChange={handleInputChange}
                                    required
                                    className='form-control'
                                />
                            </label>
                            <button
                                type="submit"
                                className={`btn btn-primary px-4 py-2 mt-3 w-100 ${!isFormValid() && 'disabled'}`}
                                disabled={!isFormValid()}
                            >
                                <Link to="/auction/Leiloes" style={{ color: 'white', textDecoration: 'none' }}>Criar</Link>
                            </button>
                        </Col>
                    </Row>
                </Form>
                {state.success && (
                    <div className="success-message text-center mt-4">
                        <p>Leilão Criado com Sucesso </p>
                        <p><Link to="/" className='text-blue'>Clique Aqui</Link> para voltar à página principal.</p>
                        <p><Link to="/leiloes" className='text-blue'>Clique Aqui</Link> para ver os leilões ativos.</p>
                    </div>
                )}
                <div className='text-center mt-4'>
                    {state.selectedObjectId ? (
                        <span className='text-success'>Objeto Selecionado</span>
                    ) : (
                        <span className='text-danger'>Nenhum Objeto Selecionado</span>
                    )}
                </div>
            </Container>
        </>
    );
}

export default CriarLeilao;
