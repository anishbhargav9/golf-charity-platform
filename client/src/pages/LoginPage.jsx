import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

class LoginPageInner extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', error: '', loading: false };
  }

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    if (!email || !password) return this.setState({ error: 'All fields required.' });
    this.setState({ loading: true, error: '' });
    const result = await this.context.login(email, password);
    if (result.success) {
      result.user.role === 'admin'
        ? this.props.navigate('/admin')
        : this.props.navigate('/dashboard');
    } else {
      this.setState({ error: result.message, loading: false });
    }
  };

  render() {
    const { email, password, error, loading } = this.state;
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your GolfGives account</p>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={email}
                onChange={this.handleChange} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={password}
                onChange={this.handleChange} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Subscribe now</Link>
          </p>
        </div>
      </div>
    );
  }
}

function LoginPage(props) {
  const navigate = useNavigate();
  return <LoginPageInner {...props} navigate={navigate} />;
}

export default LoginPage;