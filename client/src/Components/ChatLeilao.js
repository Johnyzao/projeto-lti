import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ListGroup, ListGroupItem, InputGroup, FormControl, Button } from 'react-bootstrap';
import BidMessage from './BidMessage';

const AuctionChat = () => {
  const { auctionId } = useParams();
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState('');

  const handleBidSubmit = () => {
    if (newBid) {
      setBids([...bids, { user: 'Você', amount: newBid }]);
      setNewBid('');
    }
  };
  
  return (
    <Container>
      <h2>Leilão {auctionId}</h2>
      <ListGroup>
        {bids.map((bid, index) => (
          <BidMessage key={index} bid={bid} />
        ))}
      </ListGroup>
      <InputGroup className="mt-3">
        <FormControl
          placeholder="Digite sua licitação"
          value={newBid}
          onChange={(e) => setNewBid(e.target.value)} // Update the input value
        />
        <InputGroup>
          <Button variant="primary" onClick={handleBidSubmit}>Enviar</Button>
        </InputGroup>
      </InputGroup>
    </Container>
  );
};

export default AuctionChat;
