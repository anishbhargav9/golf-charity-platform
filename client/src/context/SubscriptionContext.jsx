import React, { Component, createContext } from 'react';
import api from '../api/api';

export const SubscriptionContext = createContext();

class SubscriptionProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subscription: null,
      loading:      false,
      error:        null
    };
  }

  fetchSubscription = async () => {
    this.setState({ loading: true });
    try {
      const res = await api.get('/subscription/status');
      this.setState({ subscription: res.data, loading: false });
    } catch (err) {
      this.setState({ error: err.response?.data?.message, loading: false });
    }
  };

  subscribe = async (plan) => {
    this.setState({ loading: true, error: null });
    try {
      const res = await api.post('/subscription/subscribe', { plan });
      await this.fetchSubscription();
      this.setState({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Subscription failed';
      this.setState({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  };

  cancel = async () => {
    this.setState({ loading: true, error: null });
    try {
      await api.post('/subscription/cancel');
      await this.fetchSubscription();
      this.setState({ loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancel failed';
      this.setState({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  };

  render() {
    return (
      <SubscriptionContext.Provider value={{
        subscription:      this.state.subscription,
        loading:           this.state.loading,
        error:             this.state.error,
        fetchSubscription: this.fetchSubscription,
        subscribe:         this.subscribe,
        cancel:            this.cancel
      }}>
        {this.props.children}
      </SubscriptionContext.Provider>
    );
  }
}

export default SubscriptionProvider;