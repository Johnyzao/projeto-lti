import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Button from 'react-bootstrap/Button';

function Home() {
  const scrollToHowToUse = () => {
    const howToUseSection = document.getElementById('how-to-use');
    if (howToUseSection) {
      howToUseSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Bem-Vindo</h1>
        <p>Reencontra o que perdeste</p>

        {/* Botões "Como usar" e "Saber mais" */}
        <div style={{ marginBottom: '20px' }}>
          <Button variant="primary" onClick={scrollToHowToUse}>Como usar</Button>
          <Button variant="secondary" style={{ marginLeft: '10px' }}>Saber mais</Button>
          <Link to="/client/src/Components/JoinAuction.js">
                <button>Join Auction</button>
            </Link>
        </div>
      </div>

      {/* Seção "Como usar" */}
      <div id="how-to-use" style={{ marginTop: '50px', display: 'flex', marginLeft: '15px' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <h2>Como Usar a Aplicação</h2>
          <ol>
            <li>Faça login ou crie uma conta</li>
            <li>Faça o registro do objetivo</li>
            <li>Selecione a área onde perdeu o objeto</li>
            <li>Procure pelo objeto perdido</li>
          </ol>
        </div>
        <div style={{ flex: 1 }}>
          {/* Aqui você pode adicionar o código para incorporar o vídeo */}
          {/* Por exemplo: */}
        </div>
      </div>

      {/* Seção "Sobre Nós" */}
      <div id="about-us" style={{ marginTop: '50px', marginLeft: '15px', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px', overflow: 'hidden' }}>
        <h2 style={{ marginBottom: '20px' }}>Sobre Nós</h2>
        <p style={{ marginBottom: '20px' }}>A nossa equipa é composta por 6 elementos: Catarina Almeida, Heloísa Orvalho, Joana Rato, João Carvalho, João Almeida e Nuno Correia. Todos os membros da nossa equipa estão atualmente no terceiro e último ano da Licenciatura em Tecnologias de Informação na Faculdade de Ciências da Universidade de Lisboa.</p>
        <p>No âmbito das unidades curriculares Projeto de Tecnologias de Informação (PTI) e Projeto de Tecnologias de Redes, estamos a desenvolver um sistema de achados e perdidos.</p>
        <div className='team-members' style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', overflow: 'auto' }}>
          {teamMembers.map((member, index) => (
            <div key={index} className='member' style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
              <img src={member.image} alt={member.name} style={{ width: '150px', borderRadius: '50%', marginBottom: '10px' }} />
              <div className="member-info">
                <h2>{member.name}</h2>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};

const teamMembers = [
  { name: 'Nuno Correia', role: 'Gestor de Projeto / Programador de Back End / Especialista de Redes e Segurança', image: 'Nuno.png' },
  { name: 'João Carvalho', role: 'Arquiteto de Sistemas / Programador de Back End / Especialista de Redes e Segurança', image: 'JoaoC.png' },
  { name: 'Joana Rato', role: 'Administradora de BD / Programadora de Front End / Programadora de Back End', image: 'Joana.jpg' },
  { name: 'João Almeida', role: 'Administrador de BD / Programador de Back End / Programador de Front End', image: 'JoaoA.jpg' },
  { name: 'Heloísa Orvalho', role: 'Consultora de Dados / Técnica de Manutenção / Programador de Front End', image: 'Heloisa.png' },
  { name: 'Catarina Almeida', role: 'Testes com Utilizadores / Técnica de Manutenção / Programadora de Front End', image: 'Catarina.png' }
];

export default Home;
