import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './CSS/App.css';

class CreateAuction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            startingPrice: 0,
            endDate: '',
        };
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica para criar um novo leilão e armazenar as informações no banco de dados
        console.log('Novo leilão criado:', this.state);
        // Resetar o estado após a submissão
        this.setState({
            title: '',
            description: '',
            startingPrice: 0,
            endDate: '',
        });
    };

    render() {
        return ( <
            div className = 'item3' >
            <
            h1 > Create new Auction < /h1> <
            form onSubmit = { this.handleSubmit } >
            <
            label > Title:
            <
            input type = "text"
            name = "title"
            value = { this.state.title }
            onChange = { this.handleInputChange }
            /> < /
            label > <
            label > Description:
            <
            textarea name = "description"
            value = { this.state.description }
            onChange = { this.handleInputChange }
            /> < /
            label > <
            label > Starting price:
            <
            input type = "number"
            name = "startingPrice"
            value = { this.state.startingPrice }
            onChange = { this.handleInputChange }
            /> < /
            label > <
            label > End Date:
            <
            input type = "date"
            name = "endDate"
            value = { this.state.endDate }
            onChange = { this.handleInputChange }
            /> < /
            label > <
            button type = "submit" > Create < /button> < /
            form > <
            /div>
        );
    }
}

export default CreateAuction;