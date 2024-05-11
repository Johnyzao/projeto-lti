import React from 'react';

import VerObjetosPerdidos from './VerObjetosPerdidos';
import VerObjetosAchados from './VerObjetosAchados';

import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';

function VerObjetos() {
    return (
        <>
            <Container className='bg-light' fluid='sm'>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Objetos Perdidos registados</Accordion.Header>
                        <Accordion.Body>
                            <VerObjetosPerdidos nif={JSON.parse( localStorage.getItem("dados") ).nif}/>
                        </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                    <Accordion.Header>Objetos Achados registados</Accordion.Header>
                        <Accordion.Body>
                            <VerObjetosAchados nif={JSON.parse( localStorage.getItem("dados") ).nif}/>
                        </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            </Container>
        </>
    );
}

export default VerObjetos;
