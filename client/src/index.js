import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';

import AuthProvider from 'react-auth-kit/AuthProvider';

//https://authkit.arkadip.dev/reference/react-auth-kit/createStore/#type-parameters
import createStore from 'react-auth-kit/createStore';

// meter cookieScure = true quando tivermos TLS.

const root = ReactDOM.createRoot(document.getElementById('root'));

const store = createStore({
  authName:'auth',
  authType:'localstorage'
 });

root.render(
  <React.StrictMode>
    <AuthProvider store={store}>
        <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
