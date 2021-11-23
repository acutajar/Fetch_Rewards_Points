# Fetch Points Backend

This app was built using Node.js and Express. The unit tests utilize the Jest and supertest npm packages. This app was built and tested on Ubuntu 18.04.5.

## Background
Our users have points in their accounts. Users only see a single balance in their accounts. But for reporting purposes we actually track their
points per payer/partner. In our system, each transaction record contains: payer (string), points (integer), timestamp (date).
For earning points it is easy to assign a payer, we know which actions earned the points. And thus which partner should be paying for the points.
When a user spends points, they don't know or care which payer the points come from. But, our accounting team does care how the points are
spent. There are two rules for determining what points to "spend" first:
- We want the oldest points to be spent first (oldest based on transaction timestamp, not the order they’re received)
- We want no payer's points to go negative.

We need a web service to provide routes that:
- Add transactions for a specific payer and date.
- Spend points using the rules above and return a list of { "payer": `<string>`, "points": `<integer>` } for each call.
- Return all payer point balances.

  
## Example
  
Suppose you call your add transaction route with the following sequence of calls:
- { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
- { "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }
- { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
- { "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }
- { "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }
  
Then you call your spend points route with the following request:
  
{ "points": 5000 }
  
The expected response from the spend call would be:
  
[
  
  { "payer": "DANNON", "points": -100 },
  
  { "payer": "UNILEVER", "points": -200 },
  
  { "payer": "MILLER COORS", "points": -4,700 }
  
]
  
A subsequent call to the points balance route, after the spend, should returns the following results:
  
{
  
"DANNON": 1000,
  
"UNILEVER": 0,
  
"MILLER COORS": 5300
  
}


## API

There are 3 main calls to the API:

- `/api/add-transaction` - Takes a payer, point value, and timestamp and saves the transaction to user data
- `/api/spend-points` - Takes a point value and spends points based on provided rules. Also logs the spend transaction to user data.
- `/api/balance` - Returns the balance of each payer's points

Additionally you can check the full log of transactions, both those that add and spend points, with the following route:

- `/api/transaction-log`

## Required Software

This app requires Node.js. Please see the following link for instructions on how to download/install Node.

https://nodejs.org/en/

## Instructions to Run the Application

1. Clone the repo to your machine
2. Navigate to the the project's directory and run `npm install` to install the required packages and their dependencies
3. Run `npm start` to launch the server, and make API calls as you wish.

## Unit Tests

I have set up unit tests for the example listed in the instructions document. To run the tests, follow steps 1 and 2 above, then run `npm run test`.
