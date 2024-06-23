import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';
import Header from './Header';
import { Button } from 'react-bootstrap';
import { useAuth0 } from "@auth0/auth0-react";
import PopupVenceLeilao from '../Popups/PopupVenceuLeilao';

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
  },
  auctionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    marginLeft: '300px',
  },
  bidButton: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  },
  joinLink: {
    marginTop: '10px',
    display: 'block',
    textDecoration: 'none',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'space-around',
    borderBottom: '2px solid #ccc',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    position: 'relative',
  },
  activeTab: {
    borderBottom: '2px solid black',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
  },
  modalButton: {
    backgroundColor: 'green',
    color: 'white',
    padding: '10px 20px',
    margin: '10px 0',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
  },
  cancelButton: {
    backgroundColor: 'red',
    color: 'white',
    padding: '10px 20px',
    margin: '10px 0',
    border: 'none',
    cursor: 'pointer',
  },
  notification: {
    backgroundColor: 'lightgreen',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  errorNotification: {
    backgroundColor: 'lightcoral',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  separator: {
    borderBottom: '1px solid #ccc',
    marginBottom: '10px',
  }
};


const Leiloes = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedTab, setSelectedTab] = useState('ativos');
  const [auctions, setAuctions] = useState([]);
  const [pastAuctions, setPastAuctions] = useState([]);
  const [futureAuctions, setFutureAuctions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [notification, setNotification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('endDate');

  useEffect(() => {
    fetchAuctions();
  }, [user]);

  const fetchAuctions = async () => {
    const data_inicio = '2020-01-01'; // Example start date
    const data_fim = '2030-01-01';

    try {
      const response = await axios.get(config.LINK_API + "/auction/getAllByDate/" + data_inicio + "/" + data_fim);
      const auctions = response.data.leiloes;
      const actualAuctions = [];
      const pastAuctions = [];
      const futureAuctions = [];

      for (let auction of auctions) {
        if(auction.removido === 0) {
          const objectId = auction.id_achado;
          const response = await axios.get(config.LINK_API + "/foundObject/" + objectId);
          const actualObjectId = response.data.objAchado.id;
          const response1 = await axios.get(config.LINK_API + "/object/" + actualObjectId);
          const history = await axios.get(config.LINK_API + "/auction/" + auction.id + "/history").catch((error) => {
            return [];
          });
          const nif = user.sub.split("|")[1];
          const policia = await axios.get(
            config.LINK_API + "/police/" + nif,
            { headers: { 'Content-Type': 'application/json' } }
          ).then(res => {
            return res.data;
          }).catch(error => {
            //console.error("There was an error fetching the police!", error);
            return null;
          });
          
          if(history.length == 0) {
            auction.current_bid = "";
          } else {
            auction.current_bid = history.data.historico[history.data.historico.length - 1].valor;
          }
          auction.description = response1.data.obj.descricao;
          const startDate = new Date(auction.data_inicio);
          const endDate = new Date(auction.data_fim);
          const currentDate = new Date();
          auction.data_inicio = startDate.toLocaleDateString();
          auction.data_fim = endDate.toLocaleDateString();
          if(currentDate > endDate) {
            if(history.length == 0) {
              auction.vencedor = "Ninguém";
            } else {
              const winnersNif = history.data.historico[history.data.historico.length - 1].nif;
              if(winnersNif == nif) {
                auction.vencedor = "Você";
              } else {
                const u = await axios.get(config.LINK_API + "/user/" + winnersNif).catch((error) => {
                  return null;
                });
                auction.vencedor = u.data.nome;
              }
            }
            
            auction.isDone = true;
            auction.isEditable = false;
            if(auction.description.toLowerCase().includes(searchTerm.toLowerCase())){
              pastAuctions.push(auction);
            }
          } else if(currentDate < startDate) {
            auction.vencedor = "Ninguém";
            auction.isDone = true;
            const u = await axios.get(config.LINK_API + "/user/" + nif).catch((error) => {
              return null;
            });
            auction.isEditable = u.data.tipo_conta == "a" || policia != null;
            if(auction.description.toLowerCase().includes(searchTerm.toLowerCase())){
              futureAuctions.push(auction);
            }
          } else {
            auction.isDone = false;
            auction.isEditable = false;
            if(auction.description.toLowerCase().includes(searchTerm.toLowerCase())){
              actualAuctions.push(auction);
            }
          }
  
        }
      }

      setAuctions(actualAuctions);
      setPastAuctions(pastAuctions);
      setFutureAuctions(futureAuctions);

    } catch (error) {
      console.error('Error fetching auctions:', error);
    }
  };

  function convertDateFormat(dateString) {
    // Split the date string into an array using the hyphen as a delimiter
    const dateParts = dateString.split('/');

    // Rearrange the parts into the new format YYYY-MM-DD
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    // Return the new date string
    return formattedDate;
}

  function initiateAuction(auction) {
    let now = new Date();

    // Extract the components
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let formattedDate = `${year}-${month}-${day}`;

    let fim = convertDateFormat(auction.data_fim);
    
    axios.put(
      config.LINK_API + '/auction',
      {id: auction.id, data_inicio: formattedDate, data_fim: fim, valor: auction.valor, aberto: 0},
      { headers: { 'Content-Type': 'application/json' } }
    ).then(res => {
        console.log("Auction updated successfully", res);
        fetchAuctions();
    }).catch(error => {
        console.error("There was an error updating the auction!", error);
    });
  }

  function terminarLeilao(auction) {
    let now = new Date();

    // Extract the components
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let day = String(now.getDate()).padStart(2, '0');
    let formattedDate = `${year}-${month}-${day}`;

    let inicio = convertDateFormat(auction.data_inicio);
    
    axios.put(
      config.LINK_API + '/auction',
      {id: auction.id, data_inicio: inicio, data_fim: formattedDate, valor: auction.valor, aberto: 1},
      { headers: { 'Content-Type': 'application/json' } }
    ).then(res => {
        console.log("Auction updated successfully", res);
        fetchAuctions();
    }).catch(error => {
        console.error("There was an error updating the auction!", error);
    });
    axios.get(
      config.LINK_API + "/auction/" + auction.id + "/history",
      { headers: { 'Content-Type': 'application/json' } }
    ).then(res => {
      const nif = res.data.historico[res.data.historico.length - 1].nif;
      console.log(nif)
      axios.post(
        config.LINK_API + '/auction/registerWinner',
        {nif: nif, id_leilao: auction.id},
        { headers: { 'Content-Type': 'application/json' } }
      ).then(res => {
          console.log("Winner registered successfully", res);
      }).catch(error => {
          console.error("There was an error registering the winner!", error);
      });
    }).catch(error => {
      console.error("There was an error fetching the auction history!", error);
    });

  }

  const selectTab = (tab) => {
    setSelectedTab(tab);
    setNotification('');
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  useEffect(() => {
    fetchAuctions();
  }, [searchTerm]);

  let displayedAuctions = [];
  switch (selectedTab) {
    case 'ativos':
      displayedAuctions = auctions;
      break;
    case 'passados':
      displayedAuctions = pastAuctions;
      break;
    case 'futuros':
      displayedAuctions = futureAuctions;
      break;
    default:
      displayedAuctions = auctions;
  }

  // Filtrando os leilões com base no termo de pesquisa
  displayedAuctions = displayedAuctions.filter(async (auction) => {
    const objectId = auction.id_achado;
    const response = await axios.get(config.LINK_API + "/foundObject/" + objectId);
    const actualObjectId = response.data.objAchado.id;
    const response1 = await axios.get(config.LINK_API + "/object/" + actualObjectId);

    return response1.data.obj.titulo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Ordenando os leilões com base na opção selecionada
  displayedAuctions.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <div style={styles.tabs}>
          <div
            style={selectedTab === 'passados' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => selectTab('passados')}
          >
            Leilões Passados
          </div>
          <div
            style={selectedTab === 'ativos' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => selectTab('ativos')}
          >
            Leilões Ativos
          </div>
          <div
            style={selectedTab === 'futuros' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
            onClick={() => selectTab('futuros')}
          >
            Leilões Futuros
          </div>
        </div>
        <h2>{`Leilões ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`}</h2>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              marginRight: '10px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              flex: 1,
            }}
          />
          <select
            value={sortBy}
            onChange={handleSortChange}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <option value="endDate">Ordenar por Data de Fim</option>
            <option value="currentBid">Ordenar por Oferta Atual</option>
          </select>
        </div>
        {/* Notification rendering logic can remain the same */}
        {notification && <div style={notification.includes('sucesso') ? styles.notification : styles.errorNotification}>{notification}</div>}
        {displayedAuctions.map((auction) => (
          <div key={auction.id} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
            {/* Auction details rendering logic remains the same */}
            <p><strong>Descrição: </strong> {auction.description}</p>
            <p><strong>Data de Inicio: </strong> {auction.data_inicio}</p>
            <p><strong>Data de fim: </strong> {auction.data_fim}</p>
            <p><strong>Oferta Inicial: </strong> €{auction.valor}</p>
            <p><strong>Oferta Atual: </strong> {auction.current_bid ? "€" + auction.current_bid : "No bids made"}</p>
            {auction.isDone && <p><strong>Vencedor: </strong>{auction.vencedor}</p>}
            {auction.vencedor == "Você" && auction.isDone && <PopupVenceLeilao auction={auction} ></PopupVenceLeilao>}
            {auction.vencedor != "Ninguém" != '' && auction.isDone && 
                  <Link to={`/auction/Leiloes/ChatLeilao/${auction.id}`}>
                    <button style={styles.bidButton}>Histórico</button>
                  </Link>}
            <div style={styles.auctionHeader}>
              <h3 style={{ margin: 0 }}>{auction.title}</h3>
              {!auction.isDone && (
               <div style={{ display: 'flex', marginRight: '10px' }}>
                  <Button onClick={() => terminarLeilao(auction)} style={{ ...styles.bidButton, backgroundColor: 'red', marginLeft: '10px' }}>Terminar</Button>
                  <Link to={`/auction/Leiloes/ChatLeilao/${auction.id}`}>
                    <button style={styles.bidButton}>Licitar</button>
                  </Link>
                </div>
              )}
              {auction.isEditable && (
                <>
                  <Link to={`/auction/Leiloes/EditarLeilao/${auction.id}`} style={{ textDecoration: 'none'}}>
                    <Button variant='warning'>Editar</Button>
                  </Link>
                  <Link>
                    <Button  onClick={() => initiateAuction(auction)} variant='success'>Iniciar Leilão</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leiloes;
