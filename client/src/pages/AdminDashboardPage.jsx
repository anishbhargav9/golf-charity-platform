import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/admin.css';

class AdminDashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = { stats: null, loading: true };
  }

  componentDidMount() { this.loadStats(); }

  loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      this.setState({ stats: res.data, loading: false });
    } catch (err) { this.setState({ loading: false }); }
  };

  render() {
    const { stats, loading } = this.state;
    if (loading) return <div className="page-wrapper"><p>Loading stats...</p></div>;

    const cards = [
      { label: 'Total Users',         value: stats?.totalUsers         || 0, icon: '👤' },
      { label: 'Active Subscribers',  value: stats?.activeSubscribers  || 0, icon: '✅' },
      { label: 'Total Charities',     value: stats?.totalCharities     || 0, icon: '❤️' },
      { label: 'Published Draws',     value: stats?.totalDraws         || 0, icon: '🎱' },
      { label: 'Pending Winners',     value: stats?.pendingWinners     || 0, icon: '⏳' },
      { label: 'Prize Pool (£)',      value: `£${(stats?.totalPrizePool || 0).toFixed(2)}`, icon: '💰' },
    ];

    return (
      <div className="page-wrapper">
        <h1>Admin Dashboard</h1>
        <p className="admin-sub">Platform overview</p>

        <div className="grid-3" style={{marginTop: 28}}>
          {cards.map((c,i) => (
            <div key={i} className="card admin-stat-card">
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{marginTop: 28}}>
          <h3>Quick actions</h3>
          <div className="admin-actions">
            <Link to="/admin/panel" className="btn-primary admin-action-btn">Manage Users</Link>
            <Link to="/admin/panel" className="btn-secondary admin-action-btn">Run Draw</Link>
            <Link to="/admin/panel" className="btn-success admin-action-btn">Manage Charities</Link>
            <Link to="/admin/panel" className="btn-gray admin-action-btn">Verify Winners</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminDashboardPage;