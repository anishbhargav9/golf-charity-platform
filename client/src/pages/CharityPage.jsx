import React, { Component } from 'react';
import api from '../api/api';
import '../styles/charity.css';

class CharityPage extends Component {
  constructor(props) {
    super(props);
    this.state = { charities: [], search: '', loading: true, selected: null };
  }

  componentDidMount() { this.loadCharities(); }

  loadCharities = async () => {
    try {
      const res = await api.get('/charities');
      this.setState({ charities: res.data, loading: false });
    } catch (err) { this.setState({ loading: false }); }
  };

  handleSearch = (e) => this.setState({ search: e.target.value });

  selectCharity = (c) => this.setState({ selected: c });
  closeDetail   = () => this.setState({ selected: null });

  render() {
    const { charities, search, loading, selected } = this.state;
    const filtered = charities.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper"><p>Loading charities...</p></div>;

    return (
      <div className="page-wrapper">
        <h1>Our Charities</h1>
        <p className="charity-sub">Every subscription supports a cause you choose.</p>

        <div className="charity-search">
          <input placeholder="Search charities..." value={search} onChange={this.handleSearch} />
        </div>

        {filtered.length === 0
          ? <p style={{color:'var(--gray)',marginTop:20}}>No charities found.</p>
          : <div className="grid-3" style={{marginTop: 24}}>
              {filtered.map(c => (
                <div key={c._id} className="charity-card card" onClick={() => this.selectCharity(c)}>
                  {c.featured && <span className="featured-tag">⭐ Featured</span>}
                  <h3>{c.name}</h3>
                  <p>{c.description.substring(0,120)}...</p>
                  <button className="btn-secondary" style={{marginTop:12}}>View profile</button>
                </div>
              ))}
            </div>
        }

        {/* Detail modal */}
        {selected && (
          <div className="charity-overlay" onClick={this.closeDetail}>
            <div className="charity-detail card" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={this.closeDetail}>✕</button>
              <h2>{selected.name}</h2>
              <p style={{color:'var(--gray)',marginBottom:16}}>{selected.description}</p>
              {selected.events?.length > 0 && <>
                <h4>Upcoming Events</h4>
                <ul className="event-list">
                  {selected.events.map((ev,i) => (
                    <li key={i} className="event-item">
                      <strong>{ev.title}</strong>
                      <span>{ev.description}</span>
                      {ev.eventDate && <span className="event-date">
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </span>}
                    </li>
                  ))}
                </ul>
              </>}
              {selected.website && (
                <a href={selected.website} target="_blank" rel="noreferrer" className="charity-link">
                  Visit website →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CharityPage;