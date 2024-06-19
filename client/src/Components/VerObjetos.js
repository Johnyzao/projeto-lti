import React from 'react';

import VerObjetosPerdidos from './VerObjetosPerdidos';
import VerObjetosAchados from './VerObjetosAchados';

import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import { useAuth0 } from "@auth0/auth0-react";

function VerObjetos() {

    const { user, isLoading } = useAuth0();

    return (
        <>
            <Container className='bg-light' fluid='sm'>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Objetos Perdidos registados</Accordion.Header>
                        <Accordion.Body>
                            { isLoading ? null : (<VerObjetosPerdidos nif={ user.sub.split("|")[1] }/>) }
                        </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                    <Accordion.Header>Objetos Achados registados</Accordion.Header>
                        <Accordion.Body>
                            { isLoading ? null : (<VerObjetosAchados nif={ user.sub.split("|")[1] }/>) }
                        </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            </Container>
        </>
    );
}

export default VerObjetos;
