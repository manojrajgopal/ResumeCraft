import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-file-alt me-2"></i>
          <strong>ResumeCraft</strong>
        </Link>
        
        <ul className="navbar-nav">
          <li className="nav-item active">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {/* <li className="nav-item">
            <a className="nav-link" href="#features">Features</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#templates">Templates</a>
          </li> */}
          {currentUser && (
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
          )}
        </ul>
        
        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-greeting">Hello, {currentUser.full_name}</span>
              <button className="btn btn-light" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <button className="btn btn-outline-light me-2" onClick={onLoginClick}>Login</button>
              <button className="btn btn-light" onClick={onSignupClick}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;