import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './CSS/App.css';

class ActiveAuctions extends Component {
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
        return ( <
            div className = 'item3' >
            <
            h1 > Active Auctions < /h1> <
            ul > {
                this.state.auctions.map(auction => ( <
                    li key = { auction.id } >
                    <
                    h3 > { auction.title } < /h3> <
                    p > < strong > Description: < /strong> {auction.description}</p >
                    <
                    p > < strong > End Date: < /strong> {auction.endDate}</p >
                    <
                    p > < strong > Current Bid: < /strong> ${auction.currentBid}</p >
                    <
                    Link to = { `/joinAuction/${auction.id}` } > Join Auction < /Link> < /
                    li >
                ))
            } <
            /ul> < /
            div >
        );
    }
}

export default ActiveAuctions;