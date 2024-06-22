import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ListGroup, ListGroupItem, InputGroup, FormControl, Button, Modal } from 'react-bootstrap';
import BidMessage from './BidMessage';
import Header from './Header';
import PopupVenceLeilao from '../Popups/PopupVenceuLeilao';
import axios from 'axios';
import config from '../config';

import { useAuth0 } from "@auth0/auth0-react";

const AuctionChat = () => {
  const { idLeilao } = useParams();

  const [leilao, setLeilao] = useState({});
  const [achado, setAchado] = useState({});
  const [objeto, setObjeto] = useState({});
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    // Function to fetch auction data and bids
    const fetchAuctionAndBids = async () => {
      try {
        // Reset bids state
        setBids([]);
  
        // Fetch auction details
        const auctionResponse = await axios.get(
          `${config.LINK_API}/auction/${idLeilao}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const auctionData = auctionResponse.data.leilao;
        setLeilao(auctionData);
  
        // Fetch found object details
        const id_achado = auctionData.id_achado;
        const foundObjectResponse = await axios.get(
          `${config.LINK_API}/foundObject/${id_achado}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const foundObjectData = foundObjectResponse.data.objAchado;
        setAchado(foundObjectData);
  
        // Fetch object details
        const id_objeto = foundObjectData.id;
        const objectResponse = await axios.get(
          `${config.LINK_API}/object/${id_objeto}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const objectData = objectResponse.data.obj;
        setObjeto(objectData);
  
        // Fetch auction history
        const historyResponse = await axios.get(
          `${config.LINK_API}/auction/${idLeilao}/history`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const historico = historyResponse.data.historico;
        const nif = user.sub.split("|")[1];
  
        // Prepare an array to collect all bids
        let allBids = [];
  
        // Fetch user data for each historical entry
        await Promise.all(
          historico.map(async (historicoItem) => {
            if (historicoItem.nif == nif) {
              // If it's the current user's bid
              allBids.push({ user: "Você", amount: historicoItem.valor });
            } else {
              // Fetch user name for other bids
              try {
                const userResponse = await axios.get(
                  `${config.LINK_API}/user/${historicoItem.nif}`,
                  { headers: { 'Content-Type': 'application/json' } }
                );
                const userName = userResponse.data.nome;
                allBids.push({ user: userName, amount: historicoItem.valor });
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
            }
          })
        );
  
        // Sort allBids array by amount descending
        allBids.sort((a, b) => a.amount - b.amount);
  
        // Update bids state with sorted bids
        setBids(allBids);
  
      } catch (error) {
        console.error("Error fetching auction data:", error);
      }
    };
  
    // Call fetchAuctionAndBids function when 'user' changes
    fetchAuctionAndBids();
  
  }, [user]); // Dependence on 'user' ensures useEffect runs when user changes
  

  const handleBidSubmit = () => {
    if (newBid) {
      if(newBid < leilao.valor) {
        setModalMessage("A sua licitação deve ser superior à última licitação.");
        setShowModal(true);
        setNewBid('');
      } else {
        axios.get(
          config.LINK_API + "/auction/" + leilao.id + "/history",
          { headers: {'Content-Type': 'application/json'}},
        ).then ( (res) => {
          const latest_value = res.data.historico[res.data.historico.length - 1].valor;
          if(newBid <= latest_value) {
            setModalMessage("A sua licitação deve ser superior à última licitação.");
            setShowModal(true);
            setNewBid('');
          } else {
            const nif = user.sub.split("|")[1];
            axios.post(
              config.LINK_API + "/licitante",
              {nif: nif},
              { headers: {'Content-Type': 'application/json'}},
            ).then ( (res) => {
              axios.post(
                config.LINK_API + "/makeOffer",
                {nif:nif, id_leilao:leilao.id, valor:newBid },
                { headers: {'Content-Type': 'application/json'}},
              ).then ( (res) => { 
                setBids([...bids, { user: 'Você', amount: newBid }]);
                setNewBid('');
              }).catch(function (error) {
                console.log(error);
              });
              setBids([...bids, { user: 'Você', amount: newBid }]);
              setNewBid('');
            }).catch(function (error) {
              console.log(error);
            });
          }
        }).catch(function (error) {
          console.log(error);
          const codigo = error.response.status;
          if(codigo === 404) {
            const nif = user.sub.split("|")[1];
            axios.post(
              config.LINK_API + "/licitante",
              {nif: nif},
              { headers: {'Content-Type': 'application/json'}},
            ).then ( (res) => {
              axios.post(
                config.LINK_API + "/makeOffer",
                {nif:nif, id_leilao:leilao.id, valor:newBid },
                { headers: {'Content-Type': 'application/json'}},
              ).then ( (res) => { 
                setBids([...bids, { user: 'Você', amount: newBid }]);
                setNewBid('');
              }).catch(function (error) {
                console.log(error);
              });
            }).catch(function (error) {
              console.log(error);
            });
          }
        });
      }
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
      
        <PopupVenceLeilao ></PopupVenceLeilao> 
    </Container>

    <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Aviso</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
      

    </>
  );
};

export default AuctionChat;
