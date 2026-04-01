import React, { Component } from 'react';
import api from '../api/api';
import '../styles/winner.css';

class WinnerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winners: [], selectedWinner: null,
      file: null, uploading: false,
      error: '', success: '', loading: true
    };
  }

  componentDidMount() { this.loadWinners(); }

  loadWinners = async () => {
    try {
      const res = await api.get('/winners');
      this.setState({ winners: res.data, loading: false });
    } catch (err) { this.setState({ loading: false }); }
  };

  handleFileChange = (e) => this.setState({ file: e.target.files[0] });

  handleUpload = async (e) => {
    e.preventDefault();
    const { file, selectedWinner } = this.state;
    if (!file || !selectedWinner) return this.setState({ error: 'Select a winner and choose a file.' });
    this.setState({ uploading: true, error: '', success: '' });
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('winnerId', selectedWinner._id);
    try {
      await api.post('/winners/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.setState({ success: 'Proof uploaded! Awaiting admin review.', uploading: false, file: null, selectedWinner: null });
      this.loadWinners();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || 'Upload failed.', uploading: false });
    }
  };

  render() {
    const { winners, selectedWinner, error, success, uploading, loading } = this.state;
    if (loading) return <div className="page-wrapper"><p>Loading winners...</p></div>;

    const pendingProof = winners.filter(w => !w.proofUrl && w.verificationStatus === 'pending');

    return (
      <div className="page-wrapper">
        <h1>My Winnings</h1>
        <p className="winner-sub">View your wins and submit proof for verification.</p>

        {pendingProof.length > 0 && (
          <div className="card" style={{marginTop: 24}}>
            <h3>Upload verification proof</h3>
            <p style={{color:'var(--gray)',marginBottom:14,fontSize:14}}>
              Select a win below and upload a screenshot of your scores from the golf platform.
            </p>
            {error   && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
            <form onSubmit={this.handleUpload}>
              <div className="form-group">
                <label>Select win to verify</label>
                <select onChange={e => {
                  const w = pendingProof.find(x => x._id === e.target.value);
                  this.setState({ selectedWinner: w || null });
                }} defaultValue="">
                  <option value="">-- Choose a win --</option>
                  {pendingProof.map(w => (
                    <option key={w._id} value={w._id}>
                      {w.matchType}-match — £{w.prizeAmount?.toFixed(2)} —
                      Draw {w.drawId?.month}/{w.drawId?.year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Proof file (image or PDF)</label>
                <input type="file" accept="image/*,.pdf" onChange={this.handleFileChange} />
              </div>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload proof'}
              </button>
            </form>
          </div>
        )}

        <div style={{marginTop: 24}}>
          {winners.length === 0
            ? <div className="card"><p>No wins yet — keep playing!</p></div>
            : winners.map(w => (
              <div key={w._id} className="winner-card card">
                <div className="winner-card-top">
                  <h3>{w.matchType}-Number Match</h3>
                  <span className={`badge badge-${w.verificationStatus}`}>{w.verificationStatus}</span>
                </div>
                <div className="winner-card-meta">
                  <span>Prize: <strong>£{w.prizeAmount?.toFixed(2)}</strong></span>
                  <span>Payment: <span className={`badge badge-${w.paymentStatus}`}>{w.paymentStatus}</span></span>
                  {w.drawId && <span>Draw: <strong>{w.drawId.month}/{w.drawId.year}</strong></span>}
                </div>
                {w.proofUrl && (
                  <p style={{fontSize:13,color:'var(--gray)',marginTop:8}}>
                    Proof submitted ✓
                  </p>
                )}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export default WinnerPage;