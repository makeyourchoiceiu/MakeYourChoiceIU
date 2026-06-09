import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './app/i18n';
import { ThemeProvider } from './shared/contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);