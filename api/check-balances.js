const express = require("express");
let allTransactions = require("../User_Data/All_Transactions");
let spendableTransactions = require("../User_Data/Spendable_Transactions");
let { payerBalance } = require("../User_Data/Point_Balances");
const router = express.Router();

// Route to get spendable transactions
router.get("/spendable", (req, res) => res.json(spendableTransactions));

// Route to get full transaction history
router.get("/", (req, res) => res.json(allTransactions));

// Route to get points balance
router.get("/balance", (req, res) => res.json(payerBalance));

module.exports = router;
