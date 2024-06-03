import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

class LeiloesAtivos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auctions: [
                { id: 1, title: 'Auction 1', description: 'description', endDate: '2024-12-31', currentBid: 100 },
                { id: 2, title: 'Auction 2', description: 'description', endDate: '2024-11-30', currentBid: 150 },
            ]
        };
    }

    render() {
        return (
            <div>
                <Header />
                <div className='item3 leiloes-ativos'> {/* Adicione uma classe CSS para estilização */}
                    <h1>Active Auctions</h1>
                    <ul>
                        {this.state.auctions.map(auction => (
                            <li key={auction.id}>
                                <h3>{auction.title}</h3>
                                <p><strong>Description:</strong> {auction.description}</p>
                                <p><strong>End Date:</strong> {auction.endDate}</p>
                                <p><strong>Current Bid:</strong> ${auction.currentBid}</p>
                                <Link to={`/joinAuction/${auction.id}`}>Join Auction</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default LeiloesAtivos;

// Estilos CSS
const styles = `
    .leiloes-ativos {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .leiloes-ativos h1 {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .leiloes-ativos ul {
        list-style-type: none;
        padding: 0;
    }

    .leiloes-ativos li {
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .leiloes-ativos li h3 {
        font-size: 20px;
        margin-bottom: 5px;
    }

    .leiloes-ativos p {
        margin: 0;
    }

    .leiloes-ativos a {
        color: #007bff;
        text-decoration: none;
    }

    .leiloes-ativos a:hover {
        text-decoration: underline;
    }
`;

// Adiciona os estilos ao DOM
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
