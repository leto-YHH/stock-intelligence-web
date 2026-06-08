import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Stocks from './pages/Stocks';
import Institution from './pages/Institution';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/stock-intelligence-web">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/institution" element={<Institution />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;