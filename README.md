# Safe Walk - Back-End

Software Engineering final project - This repository contains a Node.js application. This application was built as RESTFUL API service which serves our client sides (Admin dashboard & Client mobile application) 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Create a new dedicated Mongo DB and copy the connection string includes the user/password details

Create a new file called config.json with the following content

```
{
    "DB_CONNECTION_URL": "mongodb://<user>:<password>@ds215229.mlab.com:15229/<DB name>",
    "JWT_SECRET": "YOUR_SECRET_KEY",
    "TOKEN_EXPIRES_IN": 36000,
    "HTTPS_ENV": false
}
```

### Installing

Install all required packages

```
npm install
```

Install Redis NOSQL DB (Cache solution)

```
brew install redis (On mac) / For Windows use this guide https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions/
```

Run Redis server locally

```
redis-server (Inside Terminal / CMD)
```

Run

```
node index.js
```

### Notes

In order to implemet logout functionality in the front-end, you as a front-end developer will be responsible to remove the token from the application domain cookies. Cokkie name: x-auth-token

## Postman Collection

[Postman Collection](https://documenter.getpostman.com/view/5659041/SWTHbF9Z?version=latest)

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