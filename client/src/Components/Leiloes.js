import React, { Component } from 'react';
import Header from './Header';

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
      auctions: [
        { id: 1, title: 'Vestido Floral', description: 'Vestido branco às flores. Tamanho S', endDate: '2024-06-10', currentBid: 10 },
        { id: 2, title: 'Camisola Malha Azul', description: 'Camisola Malha Azul', endDate: '2024-06-07', currentBid: 15 },
      ],
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

  openModal = (auction) => {
    this.setState({ isModalOpen: true, currentAuction: auction });
  }

  closeModal = () => {
    this.setState({ isModalOpen: false, currentAuction: null, bidAmount: '', notification: '' });
  }

  handleBidChange = (event) => {
    this.setState({ bidAmount: event.target.value });
  }

  handleSubmitBid = () => {
    const { currentAuction, bidAmount, auctions } = this.state;
    const newBid = parseFloat(bidAmount);
    if (newBid > currentAuction.currentBid) {
      const updatedAuctions = auctions.map(auction => 
        auction.id === currentAuction.id ? { ...auction, currentBid: newBid } : auction
      );
      this.setState({
        auctions: updatedAuctions,
        isModalOpen: false,
        bidAmount: '',
        notification: 'Licitação registada com sucesso!'
      });
    } else {
      this.setState({ notification: 'O valor da licitação deve ser maior que a oferta atual.' });
    }

    // Limpar a mensagem de notificação após um intervalo de tempo
    setTimeout(() => {
      this.setState({ notification: '' });
    }, 3000); // Tempo em milissegundos (3 segundos)
  }

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
    displayedAuctions = displayedAuctions.filter(auction => 
      auction.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {displayedAuctions.map((auction, index) => (
              <div key={auction.id} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                <div style={styles.auctionHeader}>
                  <h3 style={{ margin: 0 }}>{auction.title}</h3>
                  <button style={styles.bidButton} onClick={() => this.openModal(auction)}>Licitar</button>
                </div>
                
                <p><strong>Descrição:</strong> {auction.description}</p>
                <p><strong>Data de fim:</strong> {auction.endDate}</p>
                <p><strong>Oferta Atual:</strong> €{auction.currentBid}</p>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div>
              <div style={styles.overlay} onClick={this.closeModal}></div>
              <div style={styles.modal}>
                <h2>Colocar Licitação</h2>
                <input
                  type="number"
                  style={styles.modalInput}
                  value={bidAmount}
                  onChange={this.handleBidChange}
                  placeholder="Introduza o valor da licitação"
                />
                {notification && <div style={notification.includes('sucesso') ? styles.notification : styles.errorNotification}>{notification}</div>}
                <div>
                  <button style={styles.modalButton} onClick={this.handleSubmitBid}>Enviar</button>
                  <button style={styles.cancelButton} onClick={this.closeModal}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  }
  
  export default Leiloes;
