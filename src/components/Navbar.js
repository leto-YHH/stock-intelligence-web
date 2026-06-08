import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: '今日市場' },
    { path: '/portfolio', label: '持股管理' },
    { path: '/stocks', label: '每週選股' },
    { path: '/institution', label: '法人共識' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Stock <span>Intelligence</span>
      </div>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;