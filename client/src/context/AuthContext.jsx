import React, { Component, createContext } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user:    JSON.parse(localStorage.getItem('user')) || null,
      token:   localStorage.getItem('token') || null,
      loading: false,
      error:   null
    };
  }

  register = async (formData) => {
    this.setState({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      this.setState({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  };

  login = async (email, password) => {
    this.setState({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ user: res.data.user, token: res.data.token, loading: false });
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      this.setState({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  };

  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  };

  updateUser = (updatedUser) => {
  const merged = { ...this.state.user, ...updatedUser };
  localStorage.setItem('user', JSON.stringify(merged));
  this.setState({ user: merged });
};

  render() {
    return (
      <AuthContext.Provider value={{
        user:       this.state.user,
        token:      this.state.token,
        loading:    this.state.loading,
        error:      this.state.error,
        login:      this.login,
        logout:     this.logout,
        register:   this.register,
        updateUser: this.updateUser
      }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;