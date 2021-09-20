const express = require("express");
let allTransactions = require("../User_Data/All_Transactions");
let spendableTransactions = require("../User_Data/Spendable_Transactions");
let {
  getTotalPoints,
  payerBalance,
  updateTotalPoints,
} = require("../User_Data/Point_Balances");
const router = express.Router();

router.post("/", (req, res) => {
  let spendMap = {};
  let spendResponse = [];
  let pointsToSpend = req.body.points;
  if (pointsToSpend <= 0) {
    return res
      .status(400)
      .json({ msg: "Error: points spent must be greater than 0" });
  }
  if (pointsToSpend > getTotalPoints()) {
    return res
      .status(400)
      .json({ msg: "Error: point balance is insufficient" });
  }

  sortByTimestamp(spendableTransactions);
  const timestamp = new Date().toISOString().slice(0, -5) + "Z";
  while (pointsToSpend > 0) {
    const transPayer = spendableTransactions[0].payer;
    const transPoints = spendableTransactions[0].points;
    if (pointsToSpend >= transPoints) {
      if (transPoints >= payerBalance[transPayer]) {
        pointsToSpend -= payerBalance[transPayer];
        spendableTransactions = spendableTransactions.filter(
          (transaction) => transaction.payer !== transPayer
        );
        updateBalances(transPayer, payerBalance[transPayer]);
      } else {
        pointsToSpend -= transPoints;
        updateBalances(transPayer, transPoints);
        spendableTransactions.splice(0, 1);
      }
    } else {
      if (pointsToSpend >= payerBalance[transPayer]) {
        pointsToSpend -= payerBalance[transPayer];
        spendableTransactions = spendableTransactions.filter(
          (transaction) => transaction.payer !== transPayer
        );
        updateBalances(transPayer, payerBalance[transPayer]);
      } else {
        spendableTransactions[0].points -= pointsToSpend;
        updateBalances(transPayer, pointsToSpend);
        pointsToSpend = 0;
      }
    }
  }

  logTransaction();
  res.send(spendResponse);

  //Helper functions for spend-points
  function sortByTimestamp(transactionsArr) {
    transactionsArr.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  }

  function updateBalances(payer, points) {
    if (payer in spendMap) {
      spendMap[payer] -= points;
    } else {
      spendMap[payer] = -points;
    }
    payerBalance[payer] -= points;
    updateTotalPoints(-points);
    // totalPoints -= points;
  }

  function logTransaction() {
    // formats expected response for spend call and adds transactions to allTransactions storage
    for (const [payer, points] of Object.entries(spendMap)) {
      spendResponse.push({ payer: payer, points: points });
      allTransactions.push({
        payer: payer,
        points: points,
        timestamp: timestamp,
      });
    }
  }
});

module.exports = router;
