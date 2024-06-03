import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 *     <Auth0Provider
        domain="dev-bsdo6ujjdkx3ra55.eu.auth0.com"
        clientId="1rdwnixb3In4mqS6xgAATkHY9BVo4y6n"
        authorizationParams={{
          redirect_uri: "http://localhost:3001/home"
        }}
      >
 *    </Auth0Provider>
 */

root.render(
  <React.StrictMode>
      <App/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
