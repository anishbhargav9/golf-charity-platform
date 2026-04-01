import React, { Component } from 'react';
import api from '../api/api';
import '../styles/draw.css';

class DrawPage extends Component {
  constructor(props) {
    super(props);
    this.state = { draws: [], loading: true };
  }

  componentDidMount() { this.loadDraws(); }

  loadDraws = async () => {
    try {
      const res = await api.get('/draws');
      this.setState({ draws: res.data, loading: false });
    } catch (err) { this.setState({ loading: false }); }
  };

  monthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];

  render() {
    const { draws, loading } = this.state;
    if (loading) return <div className="page-wrapper"><p>Loading draws...</p></div>;

    return (
      <div className="page-wrapper">
        <h1>Monthly Draws</h1>
        <p className="draw-sub">Published draw results. Match 3, 4, or 5 numbers to win.</p>

        {draws.length === 0
          ? <div className="card" style={{marginTop:28}}><p>No published draws yet. Check back soon!</p></div>
          : draws.map(draw => (
            <div key={draw._id} className="draw-card card">
              <div className="draw-header">
                <h2>{this.monthName(draw.month)} {draw.year}</h2>
                <span className="badge badge-approved">Published</span>
              </div>
              <div className="drawn-numbers-row">
                {draw.drawnNumbers.map((n,i) => (
                  <span key={i} className="draw-ball">{n}</span>
                ))}
              </div>
              <div className="draw-meta">
                <span>Algorithm: <strong>{draw.algorithmType}</strong></span>
                <span>Prize pool: <strong>£{draw.prizePool?.toFixed(2) || '0.00'}</strong></span>
                <span>Subscribers: <strong>{draw.totalSubscribers}</strong></span>
                {draw.jackpotRollover && <span className="jackpot-label">🔄 Jackpot rolled over</span>}
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}

export default DrawPage;