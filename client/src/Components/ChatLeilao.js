import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ListGroup, ListGroupItem, InputGroup, FormControl, Button } from 'react-bootstrap';
import BidMessage from './BidMessage';
import Header from './Header';
import axios from 'axios';
import config from '../config';

const AuctionChat = () => {
  const { idLeilao } = useParams();

  const [leilao, setLeilao] = useState({});
  const [achado, setAchado] = useState({});
  const [objeto, setObjeto] = useState({});

  useEffect(() => {
    axios.get(
      config.LINK_API + "/auction/" + idLeilao,
      { headers: {'Content-Type': 'application/json'}},
  ).then ( (res) => {
    setLeilao(res.data.leilao);
    const id_achado = res.data.leilao.id_achado;
    axios.get(
      config.LINK_API + "/foundObject/" + id_achado,
      { headers: {'Content-Type': 'application/json'}},
    ).then ( (res) => {
      setAchado(res.data.objAchado);
      const id_objeto = res.data.objAchado.id;
      axios.get(
        config.LINK_API + "/object/" + id_objeto,
        { headers: {'Content-Type': 'application/json'}},
      ).then( (res) => {
        setObjeto(res.data.obj);
      }).catch(function (error) {
      })
    }).catch(function (error) {
      if ( error.response ) {
          console.log(error.response);
          console.log("OBJECT ERROR");
          let codigo = error.response.status;
      }
    });
  }).catch(function (error) {
      if ( error.response ) {
          console.log(error.response);
          console.log("OBJECT ERROR");
          let codigo = error.response.status;
      }
  });
  }, []);

  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState('');

  const handleBidSubmit = () => {
    if (newBid) {
      setBids([...bids, { user: 'Você', amount: newBid }]);
      setNewBid('');
    }
  };
  
  return (
    <>
    <Header />
    <Container>
      <br></br>
      <h2>Leilão: {objeto.descricao}</h2>
      <h3>Preço Inicial: {leilao.valor}</h3>
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
      </InputGroup>
        <br></br>
        <InputGroup>
          <Button variant="primary" onClick={handleBidSubmit}>Enviar</Button>
        </InputGroup>
    </Container>
    </>
  );
};

export default AuctionChat;
