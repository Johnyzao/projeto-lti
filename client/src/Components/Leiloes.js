import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Make sure to import Link if it's used
import config from '../config';
import Header from './Header';

import { useHistory } from 'react-router-dom';
//const history = useHistory();

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

class Leiloes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'ativos',
      auctions: [],
      pastAuctions: [],
      futureAuctions: [],
      isModalOpen: false,
      currentAuction: null,
      bidAmount: '',
      notification: '',
      searchTerm: '',
      sortBy: 'endDate', // Default sorting by end date
    };
  }

  fetchAuctions = async () => {
    const data_inicio = '2020-01-01'; // Example start date
    const data_fim = '2030-01-01';
 
    try {
      const response = await axios.get(config.LINK_API + "/auction/getAllByDate/" + data_inicio + "/" + data_fim);
      const auctions = response.data.leiloes;
      const actualAuctions = [];
      const pastAuctions = [];
      const futureAuctions = [];

      for (let auction of auctions) {
        const objectId = auction.id_achado;
        const response = await axios.get(config.LINK_API + "/foundObject/" + objectId);
        const actualObjectId = response.data.objAchado.id;
        const response1 = await axios.get(config.LINK_API + "/object/" + actualObjectId);
        const history = await axios.get(config.LINK_API + "/auction/" + auction.id + "/history").catch((error) => {
          return [];
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
          auction.isDone = true;
          pastAuctions.push(auction);
        } else if(currentDate < startDate) {
          auction.isDone = true;
          futureAuctions.push(auction);
        } else {
          auction.isDone = false;
          actualAuctions.push(auction);
        }
      }


      this.setState({
        auctions: actualAuctions,
        pastAuctions: pastAuctions,
        futureAuctions: futureAuctions
      });

    } catch (error) {
      console.error('Error fetching auctions:', error);
    }
  }

  componentDidMount() {
    this.fetchAuctions();
  }

  // closeModal = () => {
  //   this.setState({ isModalOpen: false, currentAuction: null, bidAmount: '', notification: '' });
  // }

  // handleBidChange = (event) => {
  //   this.setState({ bidAmount: event.target.value });
  // }

  // handleSubmitBid = () => {
  //   const { currentAuction, bidAmount, auctions } = this.state;
  //   const newBid = parseFloat(bidAmount);

  //   if (newBid > currentAuction.currentBid) {
  //     const updatedAuctions = auctions.map(auction =>
  //       auction.id === currentAuction.id ? { ...auction, currentBid: newBid } : auction
  //     );
  //     this.setState({
  //       auctions: updatedAuctions,
  //       isModalOpen: false,
  //       bidAmount: '',
  //       notification: 'Licitação registrada com sucesso!'
  //     });
  //   } else {
  //     this.setState({ notification: 'O valor da licitação deve ser maior que a oferta atual.' });
  //   }

    // Limpar a mensagem de notificação após um intervalo de tempo
  //   setTimeout(() => {
  //     this.setState({ notification: '' });
  //   }, 3000); // Tempo em milissegundos (3 segundos)
  // }

  selectTab = (tab) => {
    this.setState({ selectedTab: tab, notification: '' });
  }

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  }

  handleSortChange = (event) => {
    this.setState({ sortBy: event.target.value });
  }

  render() {
    const { selectedTab, auctions, pastAuctions, futureAuctions, isModalOpen, bidAmount, notification, searchTerm, sortBy } = this.state;

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
              onClick={() => this.selectTab('passados')}
            >
              Leilões Passados
            </div>
            <div
              style={selectedTab === 'ativos' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => this.selectTab('ativos')}
            >
              Leilões Ativos
            </div>
            <div
              style={selectedTab === 'futuros' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
              onClick={() => this.selectTab('futuros')}
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
              onChange={this.handleSearchChange}
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
              onChange={this.handleSortChange}
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
          {notification && <div style={notification.includes('sucesso') ? styles.notification : styles.errorNotification}>{notification}</div>}
          {displayedAuctions.map((auction) => (
            <div key={auction.id} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
              <div style={styles.auctionHeader}>
                <h3 style={{ margin: 0 }}>{auction.title}</h3>
                {!auction.isDone && (
                <Link to={`/auction/Leiloes/ChatLeilao/${auction.id}`} style={{ textDecoration: 'none' }}>
                  <button style={styles.bidButton} >Licitar</button>
                </Link>
                )}
              </div>

              <p><strong>Descrição:</strong> {auction.description}</p>
              <p><strong>Data de Inicio:</strong> {auction.data_inicio}</p>
              <p><strong>Data de fim:</strong> {auction.data_fim}</p>
              <p><strong>Oferta Inicial:</strong> €{auction.valor}</p>
              <p><strong>Oferta Atual:</strong> {auction.current_bid ? "€" + auction.current_bid : "No bids made"}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Leiloes;
