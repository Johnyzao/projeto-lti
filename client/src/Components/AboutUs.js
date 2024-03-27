import React, { Component } from 'react';
import './CSS/App.css'; // Importe o arquivo de estilos específico para esta página

class AboutUs extends Component {
    render() {
        return (
            <div className='item3'>
                <h1>Sobre Nós</h1>
                <p>Bem-vindo ao nosso serviço de "Lost and Founds"! Nosso objetivo é ajudar as pessoas a encontrarem itens perdidos e a reunificá-los com seus donos.</p>
                <p>Nossa aplicação oferece uma plataforma fácil de usar onde os usuários podem relatar itens perdidos, bem como itens encontrados. Os usuários podem navegar pelos itens perdidos e encontrados, entrar em contato com os proprietários e até mesmo marcar itens como recuperados.</p>
                <p>Nós nos esforçamos para tornar a experiência o mais simples e eficiente possível, para que você possa recuperar seus itens perdidos rapidamente e sem complicações.</p>
                <p>Se você perdeu algo valioso ou encontrou algo que não é seu, não hesite em usar nossa aplicação para ajudar a resolver o problema!</p>
            </div>
        );
    }
}

export default AboutUs;

