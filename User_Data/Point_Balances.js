let totalPoints = 0;

getTotalPoints = () => totalPoints;

updateTotalPoints = (val) => (totalPoints += val);

let payerBalance = {
  // DANNON: 800,
  // UNILEVER: 200,
  // "MILLER COORS": 10000,
};

module.exports = {
  payerBalance,
  updateTotalPoints,
  getTotalPoints,
};
