import React, { Component } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import '../styles/payment.css';

class PaymentPageInner extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: '',
      loading: false,
      error: '',
      plan: props.plan || 'monthly'
    };
  }

  formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0,2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'cardNumber') val = this.formatCardNumber(val);
    if (e.target.name === 'expiry')     val = this.formatExpiry(val);
    if (e.target.name === 'cvv')        val = val.replace(/\D/g,'').slice(0,3);
    this.setState({ [e.target.name]: val, error: '' });
  };

  handleSubmit = async (e) => {
  e.preventDefault();
  const { cardNumber, cardName, expiry, cvv, plan } = this.state;

  if (!cardName) return this.setState({ error: 'Name on card is required.' });
  if (cardNumber.replace(/\s/g,'').length < 16) return this.setState({ error: 'Enter a valid 16-digit card number.' });
  if (expiry.length < 5) return this.setState({ error: 'Enter a valid expiry date.' });
  if (cvv.length < 3) return this.setState({ error: 'Enter a valid CVV.' });

  this.setState({ loading: true, error: '' });

  // Simulate payment processing delay
  await new Promise(r => setTimeout(r, 2000));

  try {
    // 1. Subscribe
    await api.post('/subscription/subscribe', { plan });

    // 2. Fetch fresh user data
    const userRes = await api.get('/auth/me');

    // 3. Update context AND localStorage
    const updatedUser = {
      id:                 userRes.data._id,
      name:               userRes.data.name,
      email:              userRes.data.email,
      role:               userRes.data.role,
      subscriptionStatus: userRes.data.subscriptionStatus,
      subscriptionPlan:   userRes.data.subscriptionPlan,
      charityId:          userRes.data.charityId,
      charityPercent:     userRes.data.charityPercent
    };

    this.context.updateUser(updatedUser);

    // 4. Navigate to dashboard
    this.props.navigate('/dashboard');

  } catch (err) {
    this.setState({
      error: err.response?.data?.message || 'Payment failed. Please try again.',
      loading: false
    });
  }
};

  render() {
    const { cardNumber, cardName, expiry, cvv, loading, error, plan } = this.state;
    const amount = plan === 'yearly' ? '£100.00' : '£10.00';
    const period = plan === 'yearly' ? 'per year' : 'per month';

    return (
      <div className="payment-page">
        <div className="payment-container">

          {/* Left — Order summary */}
          <div className="payment-summary">
            <div className="payment-logo">⛳ GolfGives</div>
            <h2>Complete your subscription</h2>
            <div className="summary-box">
              <div className="summary-row">
                <span>Plan</span>
                <strong>{plan === 'yearly' ? 'Yearly' : 'Monthly'}</strong>
              </div>
              <div className="summary-row">
                <span>Charity contribution</span>
                <strong>10%+</strong>
              </div>
              <div className="summary-row">
                <span>Prize draw entry</span>
                <strong>Included</strong>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total today</span>
                <strong>{amount}</strong>
              </div>
              <p className="summary-note">Then {amount} {period}. Cancel anytime.</p>
            </div>

            <div className="payment-secure">
              <span>🔒</span>
              <span>Payments secured by Stripe</span>
            </div>
          </div>

          {/* Right — Card form */}
          <div className="payment-form-wrap">
            <h3>Payment details</h3>
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Name on card</label>
                <input
                  name="cardName"
                  value={cardName}
                  onChange={this.handleChange}
                  placeholder="John Smith"
                  autoComplete="cc-name"
                />
              </div>

              <div className="form-group">
                <label>Card number</label>
                <div className="card-input-wrap">
                  <input
                    name="cardNumber"
                    value={cardNumber}
                    onChange={this.handleChange}
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                  />
                  <span className="card-icons">💳</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry date</label>
                  <input
                    name="expiry"
                    value={expiry}
                    onChange={this.handleChange}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    name="cvv"
                    value={cvv}
                    onChange={this.handleChange}
                    placeholder="123"
                    autoComplete="cc-csc"
                    type="password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pay"
                disabled={loading}
              >
                {loading
                  ? <span className="pay-loading">Processing payment<span className="dots">...</span></span>
                  : `Pay ${amount} & Subscribe`
                }
              </button>

              <p className="payment-terms">
                By subscribing you agree to our terms. Your subscription will
                auto-renew at {amount} {period}. Cancel anytime from your dashboard.
              </p>
            </form>
          </div>

        </div>
      </div>
    );
  }
}

function PaymentPage(props) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const plan      = location.state?.plan || 'monthly';
  return <PaymentPageInner {...props} navigate={navigate} plan={plan} />;
}

export default PaymentPage;