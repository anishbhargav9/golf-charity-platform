import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

class NavbarInner extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
  }

  toggleMenu = () => this.setState(prev => ({ menuOpen: !prev.menuOpen }));

  handleLogout = () => {
    this.context.logout();
    this.props.navigate('/');
  };

  render() {
    const { user } = this.context;
    const { menuOpen } = this.state;

    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">⛳ GolfGives</Link>
        </div>

        <button className="hamburger" onClick={this.toggleMenu}>☰</button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/charities" onClick={this.toggleMenu}>Charities</Link></li>
          <li><Link to="/draw"      onClick={this.toggleMenu}>Draw</Link></li>

          {!user && <>
            <li><Link to="/login"    onClick={this.toggleMenu}>Login</Link></li>
            <li><Link to="/register" onClick={this.toggleMenu} className="nav-cta">Subscribe</Link></li>
          </>}

          {user && <>
            <li><Link to="/dashboard" onClick={this.toggleMenu}>Dashboard</Link></li>
            <li><Link to="/scores"    onClick={this.toggleMenu}>My Scores</Link></li>
            <li><Link to="/winners"   onClick={this.toggleMenu}>Winners</Link></li>
            {user.role === 'admin' && <>
              <li><Link to="/admin"       onClick={this.toggleMenu}>Admin</Link></li>
              <li><Link to="/admin/panel" onClick={this.toggleMenu}>Panel</Link></li>
            </>}
            <li>
              <button className="btn-logout" onClick={this.handleLogout}>Logout</button>
            </li>
          </>}
        </ul>
      </nav>
    );
  }
}

function Navbar(props) {
  const navigate = useNavigate();
  return <NavbarInner {...props} navigate={navigate} />;
}

export default Navbar;