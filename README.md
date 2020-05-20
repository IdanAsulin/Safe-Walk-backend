# Safe Walk - Back-End

![Image description](https://github.com/IdanAsulin/Safe-Walk-backend/blob/master/Images/Main%20algorithm%20flow%20chart.png)

Software Engineering final project - This repository contains a Node.js application. This application was built as RESTFUL API service which serves our client sides (Admin dashboard & Client mobile application) 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Create a new dedicated Mongo DB and copy the connection string includes the user/password details

Create new AWS Lambda function and copy the content of each "index.js" file inside "AWS Lambda Functions" directory

Create a new file called config.json with the following content

```
{
    "DB_CONNECTION_URL": "mongodb://<user>:<password>@ds215229.mlab.com:15229/<DB name>",
    "JWT_SECRET": "YOUR_SECRET_KEY",
    "TOKEN_EXPIRES_IN": 36000,
    "HTTPS_ENV": false,
    "CACHE_TTL_FOR_GET_REQUESTS": 5000,
    "AWS_ACC_KEY_ID": "AWS ACCESS KEY ID",
    "AWS_SEC_ACC_KEY": "AWS SECRET ACCESS KEY",
    "AWS_REGION": "AWS REGION",
    "LAMBDA_SECRET_KEY": "YOUR SECRET TOKEN FOR LAMBDA REQUESTS",
    "CALIBRATION_LENGTH": 150,
    "SAMPLE_TIME": <THE NUMBER OF SECONDS THE SENSOR TAKES SAMPLES>,
    "MIN_GAIT_CYCLES": 7,
    "STD_DEVIATIONS_FACTOR": 3
}
```

### Installing

Install all required packages

```
npm install
```

Install Redis on your local machine (Cache solution)

```
brew install redis (On mac)
```
[Windows guide](https://redislabs.com/blog/redis-on-windows-8-1-and-previous-versions)

Run Redis server locally and leave the terminal window open

```
npm run start-redis
```

Run

```
npm start
```

### Special scripts

Start REDIS server

```
npm run start-redis
```

Flush all DBs inside REDIS

```
npm run flush-redis
```

## Postman Collection

[Postman Collection](https://documenter.getpostman.com/view/5659041/SWTHbF9Z?version=latest)

## Deployment

This application deployed on an EC2 instance on AWS platform - 
[Server URL](http://ec2-3-89-190-108.compute-1.amazonaws.com:3000)

## Built With

* [Node.js](http://www.dropwizard.io/1.0.2/docs/) - Programming language
* [C++](http://www.cplusplus.com/) - Programming language used for Arduino
* [NPM](https://www.npmjs.com/) - Dependency Management
* [AWS Lambda Functions](https://docs.aws.amazon.com/lambda/index.html) - Heavy computations made with Serverless technology
* [Redis](https://redis.io) - Cache mechanism
* [Express](https://expressjs.com/) - Web framework
* [Mongo DB](https://www.mongodb.com/) - Database
* [Winston](https://github.com/winstonjs/winston) - Logs management
* [JWT](https://www.npmjs.com/package/jsonwebtoken) - Token based authentication management
* [Arduino Nano 33 IOT](https://store.arduino.cc/arduino-nano-33-iot) - Computing unit with an IMU sensor for human walking measurement

## Authors

* **Idan Asulin**
* **Avraham Neeman**
* **Yaniv Ziperfal**
