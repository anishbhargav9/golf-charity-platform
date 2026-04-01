import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import '../styles/dashboard.css';

class DashboardPage extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      subscription: null, scores: [],
      winners: [], currentDraw: null, loading: true
    };
  }

  componentDidMount() { this.loadAll(); }

  loadAll = async () => {
  try {
    const [subRes, scoreRes, winRes, drawRes] = await Promise.all([
      api.get('/subscription/status'),
      api.get('/scores').catch(() => ({ data: { scores: [] } })),
      api.get('/winners').catch(() => ({ data: [] })),
      api.get('/draws/current').catch(() => ({ data: null }))
    ]);
    this.setState({
      subscription: subRes.data,
      scores:       scoreRes.data.scores || [],
      winners:      Array.isArray(winRes.data) ? winRes.data : [],
      currentDraw:  drawRes.data,
      loading:      false
    });
  } catch (err) {
    console.error('Dashboard load error:', err);
    this.setState({ loading: false });
  }
};

  render() {
    const { user } = this.context;
    const { subscription, scores, winners, currentDraw, loading } = this.state;
    if (loading) return <div className="page-wrapper"><p>Loading dashboard...</p></div>;

    const totalWon = winners
      .filter(w => w.paymentStatus === 'paid')
      .reduce((s, w) => s + w.prizeAmount, 0);

    return (
      <div className="page-wrapper dashboard">
        <h1>Welcome, {user?.name} 👋</h1>
        <p className="dash-sub">Here's your GolfGives overview</p>

        <div className="grid-2" style={{marginTop: 28}}>

          {/* Subscription status */}
          <div className="card">
            <h3>Subscription</h3>
            {subscription ? <>
              <span className={`badge badge-${subscription.status}`}>{subscription.status}</span>
              <p className="dash-info">Plan: <strong>{subscription.plan}</strong></p>
              <p className="dash-info">Amount: <strong>£{subscription.amount}/
                {subscription.plan === 'yearly' ? 'yr' : 'mo'}</strong></p>
              <p className="dash-info">Renews: <strong>
                {new Date(subscription.renewalDate).toLocaleDateString()}</strong></p>
            </> : <p className="dash-info">No active subscription.
              <Link to="/register" style={{color:'var(--accent)',marginLeft:6}}>Subscribe now</Link>
            </p>}
          </div>

          {/* Score summary */}
          <div className="card">
            <h3>My Scores</h3>
            {scores.length === 0
              ? <p className="dash-info">No scores yet. <Link to="/scores" style={{color:'var(--accent)'}}>Add scores</Link></p>
              : <ul className="score-list">
                  {scores.slice(0,5).map((s,i) => (
                    <li key={i} className="score-list-item">
                      <span className="score-val">{s.value}</span>
                      <span className="score-date">{new Date(s.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
            }
            <Link to="/scores" className="dash-link">Manage scores →</Link>
          </div>

          {/* Current draw */}
          <div className="card">
            <h3>Current Draw</h3>
            {currentDraw && currentDraw.status === 'published' ? <>
              <p className="dash-info">Month: <strong>{currentDraw.month}/{currentDraw.year}</strong></p>
              <div className="drawn-numbers">
                {currentDraw.drawnNumbers.map((n,i) => (
                  <span key={i} className="drawn-ball">{n}</span>
                ))}
              </div>
              {currentDraw.jackpotRollover && (
                <p className="jackpot-roll">🔄 Jackpot rolled over!</p>
              )}
            </> : <p className="dash-info">Draw results will be published soon.</p>}
            <Link to="/draw" className="dash-link">View all draws →</Link>
          </div>

          {/* Winnings */}
          <div className="card">
            <h3>My Winnings</h3>
            <p className="dash-info">Total paid out: <strong>£{totalWon.toFixed(2)}</strong></p>
            <p className="dash-info">Total wins: <strong>{winners.length}</strong></p>
            {winners.slice(0,3).map(w => (
              <div key={w._id} className="winner-row">
                <span>{w.matchType}-match — £{w.prizeAmount.toFixed(2)}</span>
                <span className={`badge badge-${w.paymentStatus}`}>{w.paymentStatus}</span>
              </div>
            ))}
            <Link to="/winners" className="dash-link">View all →</Link>
          </div>

        </div>

        {/* Charity */}
        {user?.charityId && (
          <div className="card" style={{marginTop: 20}}>
            <h3>Your Charity</h3>
            <p className="dash-info">Supporting: <strong>{user.charityId.name || 'Your selected charity'}</strong></p>
            <p className="dash-info">Contribution: <strong>{user.charityPercent}%</strong> of your subscription</p>
          </div>
        )}
      </div>
    );
  }
}

export default DashboardPage;