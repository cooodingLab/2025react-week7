// 負責將 React 應用程式掛載到 DOM 上，並提供 Redux Store 給全域使用。

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { store } from './store/store.js'; // 引入 Redux store

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App.jsx';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 透過 Provider 將 Redux Store 注入整個應用程式，讓所有子元件都能存取全域狀態 */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
