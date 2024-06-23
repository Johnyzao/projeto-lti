import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const PopupVenceuLeilao = ({ auction }) => {
    const [showModal, setShowModal] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        navigate('../auction/Leiloes/PaginaPagamento/' + auction.id); // Use navigate instead of history.push
    };

    return (
        <>
            <Button variant="secondary" onClick={handleShow}>
                WINNER
            </Button>

            {showModal && <Confetti width={windowDimensions.width} height={windowDimensions.height} />}

            <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Parabéns!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h2 className="text-center">Você venceu o leilão!</h2>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}>
                        Pagar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PopupVenceuLeilao;
