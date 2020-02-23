# Safe Walk - Back-End

Software Engineering final project - This repository contains a Node.js application. This application was built as RESTFUL API service which serves our client sides (Admin dashboard & Client mobile application) 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Create a new dedicated Mongo DB and copy the connection string includes the user/password details

Create a new file called config.json with the following content

```
{
    "DB_CONNECTION_URL": "mongodb://<user>:<password>@ds215229.mlab.com:15229/<DB name>"
}
```

### Installing

A step by step series of examples that tell you how to get a development env running

Install all required packages

```
npm install
```

Run

```
node index.js
```

## Postman Collection

https://documenter.getpostman.com/view/5659041/SWTHbF9Z?version=latest

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Node.js](http://www.dropwizard.io/1.0.2/docs/) - Programming language
* [NPM](https://www.npmjs.com/) - Dependency Management
* [Express](https://expressjs.com/) - Web framework
* [Mongo DB](https://www.mongodb.com/) - Database
* [Winston](https://github.com/winstonjs/winston) - Logs management

## Authors

* **Idan Asulin**
* **Avraham Neeman**
* **Yaniv Zipperfal**