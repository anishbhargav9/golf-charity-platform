const MONTHLY_PRICE = 10;
const YEARLY_PRICE  = 100;
const PRIZE_POOL_PERCENT = 0.60;

function calcPrizePool(activeSubscribers, plan = 'monthly') {
  const price = plan === 'yearly' ? YEARLY_PRICE / 12 : MONTHLY_PRICE;
  const total = activeSubscribers * price;
  return parseFloat((total * PRIZE_POOL_PERCENT).toFixed(2));
}

function calcPools(totalPool, jackpotCarried = 0) {
  return {
    five:  parseFloat((totalPool * 0.40 + jackpotCarried).toFixed(2)),
    four:  parseFloat((totalPool * 0.35).toFixed(2)),
    three: parseFloat((totalPool * 0.25).toFixed(2))
  };
}

function splitPrize(poolAmount, winnersCount) {
  if (winnersCount === 0) return 0;
  return parseFloat((poolAmount / winnersCount).toFixed(2));
}

module.exports = { calcPrizePool, calcPools, splitPrize };