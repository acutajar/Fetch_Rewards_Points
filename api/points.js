const express = require("express");
const allTransactions = require("../User_Data/All_Transactions");
const spendableTransactions = require("../User_Data/Spendable_Transactions");
const router = express.Router();

let totalPoints = 11300;

let payerBalance = {
  DANNON: 1100,
  UNILEVER: 200,
  "MILLER COORS": 10000,
};

// Route to get spendable transactions
router.get("/spendable", (req, res) => res.json(spendableTransactions));

// Route to get full transaction history
router.get("/", (req, res) => res.json(allTransactions));

// Route to get points balance
router.get("/balance", (req, res) => res.json(payerBalance));

// Add a new transaction
router.post("/add-transaction", (req, res) => {
  const newTransaction = {
    payer: req.body.payer,
    points: req.body.points,
    timestamp: req.body.timestamp,
  };

  if (
    !newTransaction.payer ||
    !newTransaction.points ||
    !newTransaction.timestamp
  ) {
    return res
      .status(400)
      .json({ msg: "Please include a payer, points, and timestamp" });
  }

  // check and handle if transaction makes a payer's points go negative
  if (newTransaction.points >= 0) {
    allTransactions.push(newTransaction);
    spendableTransactions.push(newTransaction);
    sortByTimestamp(spendableTransactions);
  } else {
    if (
      !(newTransaction.payer in payerBalance) ||
      newTransaction.points + payerBalance[newTransaction.payer] < 0
    ) {
      return res.status(400).json({
        msg: `Error: transaction causes ${newTransaction.payer} to have negative point value`,
      });
    } else {
      addNegativePoints(newTransaction.payer, newTransaction.points);
      allTransactions.push(newTransaction);
    }
  }

  // Update or add to payerBalance and update totalPoints
  if (newTransaction.payer in payerBalance) {
    payerBalance[newTransaction.payer] += newTransaction.points;
  } else {
    payerBalance[newTransaction.payer] = newTransaction.points;
  }
  totalPoints += newTransaction.points;

  res.send(
    `Transaction: ${newTransaction.payer} : ${newTransaction.points} points added.`
  );

  //Helper functions for add-transaction
  function sortByTimestamp(transactionsArr) {
    transactionsArr.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  }

  function addNegativePoints(payer, points) {
    let i = 0;
    points *= -1;
    while (points > 0) {
      if (spendableTransactions[i].payer == payer) {
        if (points >= spendableTransactions[i].points) {
          points -= spendableTransactions[i].points;
          spendableTransactions.splice(i, 1);
          i--;
        } else {
          spendableTransactions[i].points -= points;
          points = 0;
        }
      }
      i++;
    }
  }
});

// Spend Points
router.post("/spend-points", (req, res) => {
  let spendMap = {};
  let spendResponse = [];
  let pointsToSpend = req.body.points;
  if (pointsToSpend <= 0) {
    return res
      .status(400)
      .json({ msg: "Error: points spent must be greater than 0" });
  }
  if (pointsToSpend > totalPoints) {
    return res
      .status(400)
      .json({ msg: "Error: point balance is insufficient" });
  }

  const timestamp = new Date().toISOString().slice(0, -5) + "Z";
  while (pointsToSpend > 0) {
    if (pointsToSpend >= spendableTransactions[0].points) {
      pointsToSpend -= spendableTransactions[0].points;
      accumulateSpent(
        spendableTransactions[0].payer,
        spendableTransactions[0].points
      );
      spendableTransactions.splice(0, 1);
    } else {
      spendableTransactions[0].points -= pointsToSpend;
      accumulateSpent(spendableTransactions[0].payer, pointsToSpend);
      pointsToSpend = 0;
    }
  }

  updatePointBalances();
  logTransaction();
  res.send(spendResponse);

  //Helper functions for spend-points
  function accumulateSpent(payer, points) {
    if (payer in spendMap) {
      spendMap[payer] -= points;
    } else {
      spendMap[payer] = -points;
    }
  }

  function updatePointBalances() {
    for (const [payer, points] of Object.entries(spendMap)) {
      payerBalance[payer] += points;
      totalPoints += points;
    }
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
