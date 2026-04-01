import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider        from './context/AuthContext';
import SubscriptionProvider from './context/SubscriptionContext';
import ProtectedRoute      from './components/ProtectedRoute';
import AdminRoute          from './components/AdminRoute';
import Navbar              from './components/Navbar';
import PaymentPage from './pages/PaymentPage';
import HomePage            from './pages/HomePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import DashboardPage       from './pages/DashboardPage';
import ScoreEntryPage      from './pages/ScoreEntryPage';
import DrawPage            from './pages/DrawPage';
import CharityPage         from './pages/CharityPage';
import WinnerPage          from './pages/WinnerPage';
import AdminDashboardPage  from './pages/AdminDashboardPage';
import AdminPanel          from './pages/AdminPanel';

import './styles/index.css';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/"          element={<HomePage />} />
              <Route path="/login"     element={<LoginPage />} />
              <Route path="/register"  element={<RegisterPage />} />
              <Route path="/charities" element={<CharityPage />} />
              <Route path="/payment" element={
  <ProtectedRoute><PaymentPage /></ProtectedRoute>
} />

              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              }/>
              <Route path="/scores" element={
                <ProtectedRoute><ScoreEntryPage /></ProtectedRoute>
              }/>
              <Route path="/draw" element={
                <ProtectedRoute><DrawPage /></ProtectedRoute>
              }/>
              <Route path="/winners" element={
                <ProtectedRoute><WinnerPage /></ProtectedRoute>
              }/>
              <Route path="/admin" element={
                <AdminRoute><AdminDashboardPage /></AdminRoute>
              }/>
              <Route path="/admin/panel" element={
                <AdminRoute><AdminPanel /></AdminRoute>
              }/>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </AuthProvider>
    );
  }
}

export default App;