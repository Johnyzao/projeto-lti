import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Header from '../Components/Header';

const initialOptions = {
  "client-id": "Aalgi6aG3CHlQWcnsrYpgP_WD4eQdQh6_8645bSNzHGlu4L4jSnpRnElmq_83mUOg9Jhx4cliJzLahI9",
  currency: "EUR",
  intent: "capture",
};

function PaginaPagamento() {
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

      <PayPalScriptProvider options={initialOptions}>
        <div className="payment-container">
          <h1 className="payment-title">Pagamento Seguro</h1>
          <div className="paypal-buttons-container">
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      description: "Cool looking table",
                      amount: {
                        currency_code: "EUR",
                        value: 65.0,
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
