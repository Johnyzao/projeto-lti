import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

// TODO:
//  - Link do texto sign Up no login está incorreto;
//  - Proteger routes para apenas users autenticados;
//  - Refresh dos tokens;
//  - Criar users na BD do Auth0;

root.render(
    <Auth0Provider
      domain="dev-bsdo6ujjdkx3ra55.eu.auth0.com"
      clientId="132Pf8v9ahcEbUS9gRJF75cqifSHhHj9"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
