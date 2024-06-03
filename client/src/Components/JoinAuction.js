import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './CSS/App.css';

class JoinAuction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auction: {
                id: 1,
                title: 'Example Auction',
                description: 'Description of the auction',
                currentBid: 100,
            },
            newBid: 0,
        };
    }

    handleBidChange = (e) => {
        this.setState({ newBid: e.target.value });
    };

    placeBid = () => {
        const { auction, newBid } = this.state;
        // adicionar a lógica para enviar o lance para o leilão
        console.log(`New bid of ${newBid} for the auction ${auction.title}`);
        // Atualizar o lance atual no estado
        this.setState(prevState => ({
            auction: {...prevState.auction, currentBid: parseFloat(newBid) },
            newBid: 0,
        }));
    };

    render() {
        const { auction, newBid } = this.state;

        return ( <
            div className = 'item3' >
            <
            h1 > Join Auction: { auction.title } < /h1> <
            p > < strong > Description: < /strong> {auction.description}</p >
            <
            p > < strong > Current Bid: < /strong> ${auction.currentBid}</p >
            <
            label > Your Bid: < /label> <
            input type = "number"
            value = { newBid }
            onChange = { this.handleBidChange }
            /> <
            button onClick = { this.placeBid } > Send bid < /button> < /
            div >
        );
    }
}

export default JoinAuction;