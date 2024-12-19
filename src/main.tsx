import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import Landing from './pages/Landing';
import CreateWallet from './pages/CreateWallet';
import WalletDashboard from './pages/WalletDashboard';
import ImportWallet from './pages/ImportWallet';
import { Toaster } from 'sonner';
import Login from './pages/Login';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateWallet />} />
        <Route path="/import" element={<ImportWallet />} />
        <Route path="/dashboard" element={<WalletDashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster richColors />
    </BrowserRouter>
  </React.StrictMode>
);
