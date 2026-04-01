import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SubscriptionContext } from '../context/SubscriptionContext';
import api from '../api/api';
import '../styles/auth.css';

class RegisterPageInner extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      name: '', email: '', password: '', confirm: '',
      charityId: '', charityPercent: 10, plan: 'monthly',
      charities: [], error: '', loading: false, step: 1
    };
  }

  componentDidMount() { this.loadCharities(); }

  loadCharities = async () => {
  try {
    const res = await api.get('/charities');
    this.setState({ charities: res.data });
  } catch (err) {
    console.error('Could not load charities:', err);
    // Retry after 2 seconds if server not ready
    setTimeout(this.loadCharities, 2000);
  }
};

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  setPlan = (plan) => this.setState({ plan });

  nextStep = () => {
    const { name, email, password, confirm } = this.state;
    if (!name || !email || !password) return this.setState({ error: 'All fields required.' });
    if (password !== confirm) return this.setState({ error: 'Passwords do not match.' });
    this.setState({ step: 2, error: '' });
  };

  handleSubmit = async (e) => {
  e.preventDefault();
  const { name, email, password, charityId, charityPercent, plan } = this.state;
  this.setState({ loading: true, error: '' });

  const result = await this.context.register({
    name, email, password, charityId, charityPercent
  });

  if (!result.success) {
    return this.setState({ error: result.message, loading: false });
  }

  // Go to payment page with plan info
  this.props.navigate('/payment', { state: { plan } });
};

  render() {
    const { name, email, password, confirm, charityId, charityPercent,
            plan, charities, error, loading, step } = this.state;
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <h2>{step === 1 ? 'Create account' : 'Choose your plan'}</h2>
          <p className="auth-sub">{step === 1 ? 'Join GolfGives today' : 'Select subscription & charity'}</p>
          {error && <p className="error-msg">{error}</p>}

          {step === 1 && (
            <div>
              <div className="form-group">
                <label>Full name</label>
                <input name="name" value={name} onChange={this.handleChange} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={email} onChange={this.handleChange} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={password} onChange={this.handleChange} placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input type="password" name="confirm" value={confirm} onChange={this.handleChange} placeholder="Repeat password" />
              </div>
              <button className="btn-primary auth-btn" onClick={this.nextStep}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Subscription plan</label>
                <div className="plan-selector">
                  <div className={`plan-option ${plan === 'monthly' ? 'selected' : ''}`}
                    onClick={() => this.setPlan('monthly')}>
                    <strong>£10</strong><span>/ month</span>
                  </div>
                  <div className={`plan-option ${plan === 'yearly' ? 'selected' : ''}`}
                    onClick={() => this.setPlan('yearly')}>
                    <strong>£100</strong><span>/ year (save £20)</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Choose a charity</label>
                <select name="charityId" value={charityId} onChange={this.handleChange}>
                  <option value="">-- Select charity --</option>
                  {charities.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Charity contribution: {charityPercent}%</label>
                <input type="range" name="charityPercent" min="10" max="50"
                  value={charityPercent} onChange={this.handleChange} />
                <small style={{color:'var(--gray)'}}>Minimum 10% of your subscription</small>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Subscribe & Start Playing'}
              </button>
            </form>
          )}
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }
}

function RegisterPage(props) {
  const navigate = useNavigate();
  return <RegisterPageInner {...props} navigate={navigate} />;
}

export default RegisterPage;