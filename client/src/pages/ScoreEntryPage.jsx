import React, { Component } from 'react';
import api from '../api/api';
import '../styles/score.css';

class ScoreEntryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scores: [],
      value: '',
      date: '',
      error: '',
      success: '',
      loading: false
    };
  }

  componentDidMount() { this.loadScores(); }

  loadScores = async () => {
    try {
      const res = await api.get('/scores');
      this.setState({ scores: res.data.scores || [] });
    } catch (err) {
      console.error(err);
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  };

  handleAdd = async (e) => {
    e.preventDefault();
    const { value, date } = this.state;
    if (!value || !date) return this.setState({ error: 'Score and date are required.' });
    if (Number(value) < 1 || Number(value) > 45) {
      return this.setState({ error: 'Score must be between 1 and 45.' });
    }
    this.setState({ loading: true, error: '', success: '' });
    try {
      const res = await api.post('/scores', { value: Number(value), date });
      this.setState({
        scores:  res.data.scores,
        value:   '',
        date:    '',
        loading: false,
        success: `Score ${value} added! You now have ${res.data.scores.length} score(s).`
      });
    } catch (err) {
      this.setState({
        error:   err.response?.data?.message || 'Failed to add score.',
        loading: false
      });
    }
  };

  handleDelete = async (scoreId) => {
  try {
    const res = await api.delete(`/scores/${scoreId}`);
    this.setState({
      scores:  res.data.scores,
      success: 'Score removed.',
      error:   ''
    });
  } catch (err) {
    this.setState({ error: 'Failed to delete score.' });
  }
};

  render() {
    const { scores, value, date, error, success, loading } = this.state;

    // Sort newest first for display
    const sorted = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="page-wrapper">
        <h1>My Scores</h1>
        <p className="score-sub">
          Enter your Stableford scores (1–45). Only your latest 5 are kept.
        </p>

        <div className="grid-2" style={{ marginTop: 28 }}>

          {/* Add score form */}
          <div className="card">
            <h3>Add a score</h3>
            {error   && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
            <form onSubmit={this.handleAdd}>
              <div className="form-group">
                <label>Stableford score (1–45)</label>
                <input
                  type="number"
                  name="value"
                  value={value}
                  min="1"
                  max="45"
                  onChange={this.handleChange}
                  placeholder="e.g. 32"
                />
              </div>
              <div className="form-group">
                <label>Date played</label>
                <input
                  type="date"
                  name="date"
                  value={date}
                  onChange={this.handleChange}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add score'}
              </button>
            </form>

            {/* Rolling logic explanation */}
            <div className="score-info-box">
              <p>📋 <strong>How scoring works:</strong></p>
              <ul>
                <li>Maximum 5 scores stored at any time</li>
                <li>Adding a 6th removes the oldest automatically</li>
                <li>Scores displayed newest first</li>
                <li>Valid range: 1 to 45 (Stableford format)</li>
              </ul>
            </div>
          </div>

          {/* Scores display */}
          <div className="card">
            <h3>
              Your scores
              <span className="score-count">{scores.length} / 5</span>
            </h3>

            {scores.length === 0
              ? <p style={{ color: 'var(--gray)', marginTop: 12 }}>
                  No scores entered yet. Add your first score!
                </p>
              : <>
                  <ul className="score-table">
                    <li className="score-table-header">
                      <span>#</span>
                      <span>Score</span>
                      <span>Date</span>
                      <span>Remove</span>
                    </li>
                    {sorted.map((s, i) => (
                      <li key={s._id} className="score-table-row">
                        <span className="score-rank">{i + 1}</span>
                        <span className="score-big">{s.value}</span>
                        <span className="score-date">
                          {new Date(s.date).toLocaleDateString('en-GB', {
                            day:   '2-digit',
                            month: 'short',
                            year:  'numeric'
                          })}
                        </span>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => this.handleDelete(s._id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>

                  {scores.length === 5 && (
                    <p className="score-full-msg">
                      ✅ You have 5 scores. Adding a new one will remove the oldest.
                    </p>
                  )}
                </>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ScoreEntryPage;