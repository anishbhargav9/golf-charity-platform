const Score = require('../models/Score');

function randomDraw() {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).sort((a, b) => a - b);
}

async function algorithmicDraw() {
  const allScoreDocs = await Score.find({});
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;

  allScoreDocs.forEach(doc => {
    doc.scores.forEach(s => {
      if (freq[s.value] !== undefined) freq[s.value]++;
    });
  });

  const weighted = [];
  for (let i = 1; i <= 45; i++) {
    const weight = Math.max(1, 10 - freq[i]);
    for (let w = 0; w < weight; w++) weighted.push(i);
  }

  const picked = new Set();
  let attempts = 0;
  while (picked.size < 5 && attempts < 1000) {
    const idx = Math.floor(Math.random() * weighted.length);
    picked.add(weighted[idx]);
    attempts++;
  }

  return [...picked].sort((a, b) => a - b);
}

function matchWinners(drawnNumbers, userScoreDocs) {
  const results = { '5': [], '4': [], '3': [] };
  const drawnSet = new Set(drawnNumbers);

  userScoreDocs.forEach(doc => {
    const userNums = doc.scores.map(s => s.value);
    const matches = userNums.filter(n => drawnSet.has(n)).length;
    if (matches >= 3) {
      const key = matches >= 5 ? '5' : String(matches);
      if (results[key]) results[key].push(doc.userId.toString());
    }
  });

  return results;
}

module.exports = { randomDraw, algorithmicDraw, matchWinners };