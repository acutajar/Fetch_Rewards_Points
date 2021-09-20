const express = require("express");
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// api routes
app.use("/api", require("./api/check-balances"));
app.use("/api/add-transaction", require("./api/add-transaction"));
app.use("/api/spend-points", require("./api/spend-points"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
