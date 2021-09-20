const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", require("./api/check-balances"));
app.use("/api/add-transaction", require("./api/add-transaction"));
app.use("/api/spend-points", require("./api/spend-points"));

// Tests to add each transaction
test("add-transaction 1", (done) => {
  request(app)
    .post("/api/add-transaction")
    .send({ payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" })
    .then(() => {
      request(app)
        .get("/api")
        .expect(
          [
            {
              payer: "DANNON",
              points: 1000,
              timestamp: "2020-11-02T14:00:00Z",
            },
          ],
          done
        );
    });
});

test("add-transaction 2", (done) => {
  request(app)
    .post("/api/add-transaction")
    .send({ payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" })
    .then(() => {
      request(app)
        .get("/api")
        .expect(
          [
            {
              payer: "DANNON",
              points: 1000,
              timestamp: "2020-11-02T14:00:00Z",
            },
            {
              payer: "UNILEVER",
              points: 200,
              timestamp: "2020-10-31T11:00:00Z",
            },
          ],
          done
        );
    });
});

test("add-transaction 3", (done) => {
  request(app)
    .post("/api/add-transaction")
    .send({ payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" })
    .then(() => {
      request(app)
        .get("/api")
        .expect(
          [
            {
              payer: "DANNON",
              points: 1000,
              timestamp: "2020-11-02T14:00:00Z",
            },
            {
              payer: "UNILEVER",
              points: 200,
              timestamp: "2020-10-31T11:00:00Z",
            },
            {
              payer: "DANNON",
              points: -200,
              timestamp: "2020-10-31T15:00:00Z",
            },
          ],
          done
        );
    });
});

test("add-transaction 4", (done) => {
  request(app)
    .post("/api/add-transaction")
    .send({
      payer: "MILLER COORS",
      points: 10000,
      timestamp: "2020-11-01T14:00:00Z",
    })
    .then(() => {
      request(app)
        .get("/api")
        .expect(
          [
            {
              payer: "DANNON",
              points: 1000,
              timestamp: "2020-11-02T14:00:00Z",
            },
            {
              payer: "UNILEVER",
              points: 200,
              timestamp: "2020-10-31T11:00:00Z",
            },
            {
              payer: "DANNON",
              points: -200,
              timestamp: "2020-10-31T15:00:00Z",
            },
            {
              payer: "MILLER COORS",
              points: 10000,
              timestamp: "2020-11-01T14:00:00Z",
            },
          ],
          done
        );
    });
});

test("add-transaction 5", (done) => {
  request(app)
    .post("/api/add-transaction")
    .send({ payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" })
    .then(() => {
      request(app)
        .get("/api/spendable")
        .expect(
          [
            {
              payer: "DANNON",
              points: 1000,
              timestamp: "2020-11-02T14:00:00Z",
            },
            {
              payer: "UNILEVER",
              points: 200,
              timestamp: "2020-10-31T11:00:00Z",
            },
            {
              payer: "DANNON",
              points: -200,
              timestamp: "2020-10-31T15:00:00Z",
            },
            {
              payer: "MILLER COORS",
              points: 10000,
              timestamp: "2020-11-01T14:00:00Z",
            },
            { payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" },
          ],
          done
        );
    });
});

// Testing the spend-points route
test("spend 5000 points", (done) => {
  request(app)
    .post("/api/spend-points")
    .send({ points: 5000 })
    // .expect("Content-Type", /json/)
    .expect(
      [
        { payer: "DANNON", points: -100 },
        { payer: "UNILEVER", points: -200 },
        { payer: "MILLER COORS", points: -4700 },
      ],
      done
    );
});

// Checking the final points balance
test("check points balance", (done) => {
  request(app).get("/api/balance").expect(
    {
      DANNON: 1000,
      UNILEVER: 0,
      "MILLER COORS": 5300,
    },
    done
  );
});
