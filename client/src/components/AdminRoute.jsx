import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class AdminRoute extends Component {
  static contextType = AuthContext;
  render() {
    const { user } = this.context;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return this.props.children;
  }
}

export default AdminRoute;