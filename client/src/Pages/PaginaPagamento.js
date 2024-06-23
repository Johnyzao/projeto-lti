import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Header from '../Components/Header';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import config from '../config';

const initialOptions = {
  "client-id": "Aalgi6aG3CHlQWcnsrYpgP_WD4eQdQh6_8645bSNzHGlu4L4jSnpRnElmq_83mUOg9Jhx4cliJzLahI9",
  currency: "EUR",
  intent: "capture",
};

function PaginaPagamento() {
  const { idLeilao } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [auction, setAuction] = useState({});
  const [valor, setValor] = useState(0);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    axios.get(
      config.LINK_API + "/auction/" + idLeilao,
      { headers: { 'Content-Type': 'application/json' } }
    ).then((res) => {
      setAuction(res.data.leilao);
      axios.get(
        config.LINK_API + "/auction/" +idLeilao + "/history",
        { headers: { 'Content-Type': 'application/json' } }
      ).then((res) => {
        setValor(res.data.historico[res.data.historico.length - 1].valor);
        axios.get(
          config.LINK_API + "/auction/" + idLeilao + "/objeto",
          { headers: { 'Content-Type': 'application/json' } }
        ).then((res) => {
          setDescricao(res.data.objeto.descricao);
        }).catch((err) => {
          console.error(err);
        });
      }).catch((err) => {
        console.error(err);
      });
    }).catch((err) => {
      console.error(err);
    });
  }, [user]);
  if(isLoading || valor == 0) return <div>Loading...</div>;
  return (
    <>
      <style>
        {`
          .payment-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f8f9fa;
            padding: 20px;
          }

          .payment-title {
            font-size: 2em;
            margin-bottom: 20px;
            color: #343a40;
          }

          .paypal-buttons-container {
            width: 100%;
            max-width: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .paypal-buttons-container > div {
            width: 100%;
          }
        `}
      </style>

      <Header />

      <h3>Item: {descricao}</h3>
      <h3>Valor: {valor}€</h3>

      <PayPalScriptProvider options={initialOptions}>
        <div className="payment-container">
          <h1 className="payment-title">Pagamento Seguro</h1>
          <div className="paypal-buttons-container">
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      description: descricao,
                      amount: {
                        currency_code: "EUR",
                        value: valor,
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                const order = await actions.order.capture();
                console.log(order);
              }}
              onError={(err) => {
                console.error(err);
              }}
            />
          </div>
        </div>
      </PayPalScriptProvider>
    </>
  );
}

export default PaginaPagamento;
