const express = require("express");
let allTransactions = require("../User_Data/All_Transactions");
let spendableTransactions = require("../User_Data/Spendable_Transactions");
let {
  payerBalance,
  updateTotalPoints,
} = require("../User_Data/Point_Balances");
const router = express.Router();

router.post("/", (req, res) => {
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
  } else {
    if (
      !(newTransaction.payer in payerBalance) ||
      newTransaction.points + payerBalance[newTransaction.payer] < 0
    ) {
      return res.status(400).json({
        msg: `Error: transaction causes ${newTransaction.payer} to have negative point value`,
      });
    } else {
      allTransactions.push(newTransaction);
      spendableTransactions.push(newTransaction);
    }
  }

  // Update or add to payerBalance and update totalPoints
  if (newTransaction.payer in payerBalance) {
    payerBalance[newTransaction.payer] += newTransaction.points;
  } else {
    payerBalance[newTransaction.payer] = newTransaction.points;
  }
  updateTotalPoints(newTransaction.points);

  res.send(
    `Transaction: ${newTransaction.payer} : ${newTransaction.points} points added.`
  );
});

module.exports = router;
