import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import { applySeed, initialSeed } from './ui/theme';
import { installRipple } from './ui/ripple';
import './ui/style.css';

// 先套用配色再渲染，避免首次載入時閃爍
applySeed(initialSeed());
installRipple();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
