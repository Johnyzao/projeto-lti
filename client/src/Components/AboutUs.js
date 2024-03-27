import React, { Component } from 'react';
import './CSS/App.css'; // Importe o arquivo de estilos específico para esta página
import JoanaPhoto from './Images/Joana.jpg'; // Importe as fotos dos membros da equipe
import JoaoCPhoto from './Images/JoaoC.png';
import JoaoAPhoto from './Images/JoaoA.jpg';
import HeloisaPhoto from './Images/Heloisa.png';
import CatarinaPhoto from './Images/Catarina.png';
import NunoPhoto from './Images/Nuno.png'

class AboutUs extends Component {
    render() {
        return (<div className='item3'>
                <h1>About Us</h1>
                <p>Welcome to our "Lost and Founds" service! Our team is dedicated to helping people find lost items and reunite them with their owners.</p>
                <p>Meet our team:</p>

                <div className='team-members'>
                    <div className='member'>
                        <img src={JoanaPhoto} alt='Joana' />
                        <h2>Joana Rato</h2>
                        <p>Administradora de BD</p>
                        <p>Programadora de Front End</p>
                        <p>Programadora de Back End
                        </p>
                    </div>


                    <div className='member'>
                        <img src={NunoPhoto} alt='Nuno' />
                        <h2>Nuno Correia</h2>
                        <p>Gestor de Projeto</p>
                        <p>Programador de Back End</p>
                        <p>Especialista de Redes e Segurança </p>
                    </div>
                    <div className='member'>
                        <img src={JoaoAPhoto} alt='JoaoA' />
                        <h2>João Almeida</h2>
                        <p>Administrador de BD</p>
                    <p>Programador de Back End

                    </p>
                    <p>Programador de Front End</p></div>

                    <div className='member'>
                        <img src={HeloisaPhoto} alt='Heloisa' />
                        <h2>Heloísa Orvalho</h2>
                        <p>Consultora de Dados</p>
                           <p>Técnica de Manutenção
                        </p>                    </div>

                    <div className='member'>
                        <img src={CatarinaPhoto} alt='Catarina' />
                        <h2>Catarina Almeida</h2>
                        <p>Testes com Utilizadores</p>
                            <p>Programadora de Front End </p>
                    </div>



                    <div className='member'>
                        <img src={JoaoCPhoto} alt='JoaoC' />
                        <h2>João Carvalho</h2>
                        <p>Arquiteto de Sistemas</p>
                        <p>Especialista de Redes e Segurança
                        </p>                    </div>
                </div>
            </div>
        );
    }
}

export default AboutUs;

