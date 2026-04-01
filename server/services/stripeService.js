// MOCK Stripe Service — swap with real Stripe SDK at deployment

const PLANS = {
  monthly: { amount: 10,  currency: 'gbp', interval: 'month' },
  yearly:  { amount: 100, currency: 'gbp', interval: 'year'  }
};

function createMockCustomer(email) {
  return { id: 'mock_cus_' + Date.now(), email };
}

function createMockSubscription(customerId, plan) {
  const now = new Date();
  const renewal = new Date(now);
  if (plan === 'yearly') {
    renewal.setFullYear(renewal.getFullYear() + 1);
  } else {
    renewal.setMonth(renewal.getMonth() + 1);
  }
  return {
    id:          'mock_sub_' + Date.now(),
    customerId,
    plan,
    amount:      PLANS[plan].amount,
    status:      'active',
    renewalDate: renewal
  };
}

function cancelMockSubscription(subscriptionId) {
  return { id: subscriptionId, status: 'cancelled', cancelledAt: new Date() };
}

module.exports = { createMockCustomer, createMockSubscription, cancelMockSubscription, PLANS };