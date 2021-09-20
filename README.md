# Fetch Points Backend

This app is built to satisfy all requirements listed in the "Fetch Rewards Coding Exercise - Backend Software Engineering" instructions document. This app was built using Node.js and Express. The unit tests utilize the Jest and supertest npm packages. This app was built and tested on Ubuntu 18.04.5.

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

Additionally, I have set up unit tests for the example listed in the instructions document. To run the tests, follow steps 1 and 2 above, then run `npm run test`.
