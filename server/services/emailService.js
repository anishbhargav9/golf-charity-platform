// Email service — using console.log as mock (swap nodemailer at deploy)

function sendDrawResultEmail(userEmail, drawData) {
  console.log(`[EMAIL] Draw result sent to ${userEmail}`, drawData);
  return true;
}

function sendWinnerEmail(userEmail, winnerData) {
  console.log(`[EMAIL] Winner notification sent to ${userEmail}`, winnerData);
  return true;
}

function sendSubscriptionConfirmEmail(userEmail, plan) {
  console.log(`[EMAIL] Subscription confirmed for ${userEmail} - Plan: ${plan}`);
  return true;
}

module.exports = { sendDrawResultEmail, sendWinnerEmail, sendSubscriptionConfirmEmail };