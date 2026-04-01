import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import '../styles/home.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredCharities: [],
      stats: { totalUsers: 0, totalRaised: 0, totalDraws: 0 }
    };
  }

  componentDidMount() {
    this.loadFeaturedCharities();
  }

  loadFeaturedCharities = async () => {
    try {
      const res = await api.get('/charities?featured=true');
      this.setState({ featuredCharities: res.data.slice(0, 3) });
    } catch (err) { console.error(err); }
  };

  render() {
    const { featuredCharities } = this.state;

    return (
      <div className="home">

        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <span className="hero-tag">Golf · Charity · Community</span>
            <h1>Play golf.<br/>Change lives.</h1>
            <p>
              Subscribe, enter your Stableford scores every month,
              and win prizes — while a portion of every subscription
              goes directly to a charity you care about.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">Start Playing</Link>
              <Link to="/charities" className="btn-hero-secondary">See Charities</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-stat"><span>£10</span><small>per month</small></div>
              <div className="hero-divider" />
              <div className="hero-stat"><span>10%+</span><small>to charity</small></div>
              <div className="hero-divider" />
              <div className="hero-stat"><span>Monthly</span><small>prize draw</small></div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section page-wrapper">
          <h2>How it works</h2>
          <div className="grid-3">
            <div className="how-card">
              <div className="how-number">01</div>
              <h3>Subscribe</h3>
              <p>Choose monthly or yearly. Pick a charity to support with part of your fee.</p>
            </div>
            <div className="how-card">
              <div className="how-number">02</div>
              <h3>Enter scores</h3>
              <p>Add your last 5 Stableford scores (1–45). Your rolling history is always up to date.</p>
            </div>
            <div className="how-card">
              <div className="how-number">03</div>
              <h3>Win prizes</h3>
              <p>Match 3, 4, or 5 drawn numbers each month and claim your share of the prize pool.</p>
            </div>
          </div>
        </section>

        {/* Prize tiers */}
        <section className="prize-section">
          <div className="page-wrapper">
            <h2>Prize pool breakdown</h2>
            <div className="grid-3">
              <div className="prize-card prize-3">
                <h3>3-Number Match</h3>
                <div className="prize-pct">25%</div>
                <p>of the monthly prize pool</p>
              </div>
              <div className="prize-card prize-4">
                <h3>4-Number Match</h3>
                <div className="prize-pct">35%</div>
                <p>of the monthly prize pool</p>
              </div>
              <div className="prize-card prize-5">
                <h3>5-Number Match</h3>
                <div className="prize-pct">40%</div>
                <p>Jackpot — rolls over if unclaimed!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured charities */}
        {featuredCharities.length > 0 && (
          <section className="charity-section page-wrapper">
            <h2>Charities you support</h2>
            <div className="grid-3">
              {featuredCharities.map(c => (
                <div key={c._id} className="card charity-home-card">
                  <h3>{c.name}</h3>
                  <p>{c.description.substring(0, 100)}...</p>
                  <Link to="/charities">Learn more →</Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="cta-section">
          <h2>Ready to make your game count?</h2>
          <p>Join hundreds of golfers supporting great causes every month.</p>
          <Link to="/register" className="btn-hero-primary">Subscribe now</Link>
        </section>

      </div>
    );
  }
}

export default HomePage;