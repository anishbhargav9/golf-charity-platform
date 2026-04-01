import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

class ProtectedRoute extends Component {
  static contextType = AuthContext;
  render() {
    const { user } = this.context;
    if (!user) return <Navigate to="/login" replace />;
    return this.props.children;
  }
}

export default ProtectedRoute;