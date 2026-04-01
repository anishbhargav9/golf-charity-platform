import React, { Component } from 'react';
import api from '../api/api';
import '../styles/admin.css';

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'users',
      users: [], draws: [], charities: [], winners: [],
      loading: false, error: '', success: '',
      // draw form
      algorithmType: 'random', drawMonth: '', drawYear: '', simulatedDraw: null,
      jackpotCarried: 0,
      // charity form
      charityName: '', charityDesc: '', charityFeatured: false
    };
  }

  componentDidMount() {
  setTimeout(() => {
    this.loadTab('users');
  }, 100);
}

  setTab = (tab) => {
  this.setState({ tab, error: '', success: '', loading: true });
  setTimeout(() => {
    this.loadTab(tab);
  }, 100);
};

  loadTab = async (tab) => {
    this.setState({ loading: true });
    try {
      if (tab === 'users')     { const r = await api.get('/admin/users');    this.setState({ users:     r.data }); }
      if (tab === 'draws')     { const r = await api.get('/admin/draws');    this.setState({ draws:     r.data }); }
      if (tab === 'charities') { const r = await api.get('/charities');      this.setState({ charities: r.data }); }
      if (tab === 'winners')   { const r = await api.get('/admin/winners'); this.setState({ winners:   r.data }); }
    } catch (err) { this.setState({ error: 'Failed to load data.' }); }
    this.setState({ loading: false });
  };

  // Users
  toggleUserSub = async (user) => {
    const newStatus = user.subscriptionStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/users/${user._id}`, { ...user, subscriptionStatus: newStatus });
      this.setState({ success: 'User updated.' });
      this.loadTab('users');
    } catch (err) { this.setState({ error: 'Failed to update user.' }); }
  };

  // Draw
  handleSimulate = async () => {
    const { algorithmType, drawMonth, drawYear, jackpotCarried } = this.state;
    this.setState({ loading: true, error: '', success: '' });
    try {
      const res = await api.post('/draws/simulate', {
        algorithmType,
        month: drawMonth ? Number(drawMonth) : undefined,
        year:  drawYear  ? Number(drawYear)  : undefined,
        jackpotCarried: Number(jackpotCarried)
      });
      this.setState({ simulatedDraw: res.data, success: 'Draw simulated!', loading: false });
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Simulation failed.', loading: false });
    }
  };

  handlePublish = async (drawId) => {
    this.setState({ loading: true, error: '', success: '' });
    try {
      await api.post('/draws/publish', { drawId });
      this.setState({ success: 'Draw published!', simulatedDraw: null, loading: false });
      this.loadTab('draws');
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Publish failed.', loading: false });
    }
  };

  // Charity
  handleAddCharity = async (e) => {
    e.preventDefault();
    const { charityName, charityDesc, charityFeatured } = this.state;
    if (!charityName || !charityDesc) return this.setState({ error: 'Name and description required.' });
    try {
      await api.post('/charities', { name: charityName, description: charityDesc, featured: charityFeatured });
      this.setState({ charityName: '', charityDesc: '', charityFeatured: false, success: 'Charity added!' });
      this.loadTab('charities');
    } catch (err) { this.setState({ error: 'Failed to add charity.' }); }
  };

  handleDeleteCharity = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await api.delete(`/charities/${id}`);
      this.setState({ success: 'Charity deleted.' });
      this.loadTab('charities');
    } catch (err) { this.setState({ error: 'Failed to delete charity.' }); }
  };

  // Winners
  handleVerify = async (id, status) => {
    try {
      await api.put(`/winners/${id}/verify`, { status });
      this.setState({ success: `Winner ${status}.` });
      this.loadTab('winners');
    } catch (err) { this.setState({ error: 'Failed to verify.' }); }
  };

  handlePayout = async (id) => {
    try {
      await api.put(`/winners/${id}/payout`);
      this.setState({ success: 'Marked as paid.' });
      this.loadTab('winners');
    } catch (err) { this.setState({ error: 'Failed to mark paid.' }); }
  };

  render() {
    const { tab, users, draws, charities, winners, loading, error, success,
            algorithmType, drawMonth, drawYear, jackpotCarried, simulatedDraw,
            charityName, charityDesc, charityFeatured } = this.state;

    return (
      <div className="page-wrapper">
        <h1>Admin Panel</h1>
        <div className="admin-tabs">
          {['users','draws','charities','winners'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => this.setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {error   && <p className="error-msg"   style={{margin:'12px 0'}}>{error}</p>}
        {success && <p className="success-msg" style={{margin:'12px 0'}}>{success}</p>}
        {loading && <p style={{color:'var(--gray)'}}>Loading...</p>}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="card" style={{marginTop:20}}>
            <h3>All Users ({users.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Sub Status</th><th>Plan</th><th>Charity %</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge badge-pending">{u.role}</span></td>
                      <td><span className={`badge badge-${u.subscriptionStatus === 'active' ? 'active' : 'inactive'}`}>{u.subscriptionStatus}</span></td>
                      <td>{u.subscriptionPlan || '—'}</td>
                      <td>{u.charityPercent}%</td>
                      <td>
                        <button className="btn-sm btn-secondary"
                          onClick={() => this.toggleUserSub(u)}>
                          {u.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRAWS TAB */}
        {tab === 'draws' && (
          <div>
            <div className="card" style={{marginTop:20}}>
              <h3>Run a draw</h3>
              <div className="draw-form">
                <div className="form-group">
                  <label>Algorithm</label>
                  <select value={algorithmType} onChange={e => this.setState({ algorithmType: e.target.value })}>
                    <option value="random">Random</option>
                    <option value="algorithmic">Algorithmic (weighted)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Month (1–12, blank = current)</label>
                  <input type="number" min="1" max="12" value={drawMonth}
                    onChange={e => this.setState({ drawMonth: e.target.value })} placeholder="Current month" />
                </div>
                <div className="form-group">
                  <label>Year (blank = current)</label>
                  <input type="number" value={drawYear}
                    onChange={e => this.setState({ drawYear: e.target.value })} placeholder="Current year" />
                </div>
                <div className="form-group">
                  <label>Jackpot carried amount (£)</label>
                  <input type="number" min="0" value={jackpotCarried}
                    onChange={e => this.setState({ jackpotCarried: e.target.value })} />
                </div>
                <button className="btn-secondary" onClick={this.handleSimulate}>Simulate draw</button>
              </div>

              {simulatedDraw && (
                <div className="simulated-result">
                  <h4>Simulated numbers:</h4>
                  <div style={{display:'flex',gap:10,margin:'12px 0',flexWrap:'wrap'}}>
                    {simulatedDraw.draw?.drawnNumbers?.map((n,i) => (
                      <span key={i} className="draw-ball-sm">{n}</span>
                    ))}
                  </div>
                  <p style={{fontSize:14,color:'var(--gray)',marginBottom:12}}>
                    Prize pool: £{simulatedDraw.draw?.prizePool?.toFixed(2)}
                  </p>
                  <button className="btn-primary"
                    onClick={() => this.handlePublish(simulatedDraw.draw._id)}>
                    Publish this draw
                  </button>
                </div>
              )}
            </div>

            <div className="card" style={{marginTop:20}}>
              <h3>All draws</h3>
              {draws.map(d => (
                <div key={d._id} className="draw-row">
                  <span><strong>{d.month}/{d.year}</strong></span>
                  <span>{d.drawnNumbers.join(', ') || 'No numbers'}</span>
                  <span className={`badge badge-${d.status === 'published' ? 'approved' : 'pending'}`}>{d.status}</span>
                  <span>£{d.prizePool?.toFixed(2) || '0.00'}</span>
                  {d.status === 'simulated' && (
                    <button className="btn-sm btn-primary" onClick={() => this.handlePublish(d._id)}>Publish</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARITIES TAB */}
        {tab === 'charities' && (
          <div>
            <div className="card" style={{marginTop:20}}>
              <h3>Add charity</h3>
              <form onSubmit={this.handleAddCharity}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={charityName} onChange={e => this.setState({ charityName: e.target.value })} placeholder="Charity name" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={charityDesc}
                    onChange={e => this.setState({ charityDesc: e.target.value })} placeholder="About the charity" />
                </div>
                <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,cursor:'pointer'}}>
                  <input type="checkbox" checked={charityFeatured}
                    onChange={e => this.setState({ charityFeatured: e.target.checked })} />
                  Feature on homepage
                </label>
                <button type="submit" className="btn-success">Add charity</button>
              </form>
            </div>
            <div className="card" style={{marginTop:20}}>
              <h3>All charities ({charities.length})</h3>
              {charities.map(c => (
                <div key={c._id} className="charity-row">
                  <div>
                    <strong>{c.name}</strong>
                    {c.featured && <span className="badge badge-approved" style={{marginLeft:8}}>Featured</span>}
                    <p style={{fontSize:13,color:'var(--gray)',marginTop:4}}>{c.description.substring(0,80)}...</p>
                  </div>
                  <button className="btn-sm btn-danger" onClick={() => this.handleDeleteCharity(c._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINNERS TAB */}
        {tab === 'winners' && (
          <div className="card" style={{marginTop:20}}>
            <h3>All winners ({winners.length})</h3>
            {winners.length === 0
              ? <p style={{color:'var(--gray)'}}>No winners yet.</p>
              : winners.map(w => (
                <div key={w._id} className="winner-admin-row">
                  <div>
                    <strong>{w.userId?.name}</strong> — {w.userId?.email}
                    <p style={{fontSize:13,color:'var(--gray)',margin:'4px 0'}}>
                      {w.matchType}-match | £{w.prizeAmount?.toFixed(2)} | Draw {w.drawId?.month}/{w.drawId?.year}
                    </p>
                    <span className={`badge badge-${w.verificationStatus}`}>{w.verificationStatus}</span>
                    <span className={`badge badge-${w.paymentStatus}`} style={{marginLeft:6}}>{w.paymentStatus}</span>
                    {w.proofUrl && <span style={{marginLeft:8,fontSize:12,color:'var(--success)'}}>Proof uploaded ✓</span>}
                  </div>
                  <div className="winner-admin-actions">
                    {w.verificationStatus === 'pending' && <>
                      <button className="btn-sm btn-success" onClick={() => this.handleVerify(w._id,'approved')}>Approve</button>
                      <button className="btn-sm btn-danger"  onClick={() => this.handleVerify(w._id,'rejected')}>Reject</button>
                    </>}
                    {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                      <button className="btn-sm btn-secondary" onClick={() => this.handlePayout(w._id)}>Mark paid</button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    );
  }
}

export default AdminPanel;