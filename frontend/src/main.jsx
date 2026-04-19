import React from 'react';
import ReactDOM from 'react-dom/client';
import AppProvider from './app/provider.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider />
  </React.StrictMode>
);
