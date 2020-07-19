# Safe Walk - Back-End

Software Engineering final project - This repository contains a Node.js application. This application was built as RESTFUL API service which serves our client sides (Admin dashboard & Client mobile application) 

## The Main Workflow
![Image description](https://github.com/IdanAsulin/Safe-Walk-backend/blob/master/Images/Main%20workflow%20diagram.png)

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
    "TOKEN_EXPIRES_IN": "2 hours",
    "CACHE_TTL_FOR_GET_REQUESTS": 60,
    "AWS_ACC_KEY_ID": "AWS ACCESS KEY ID",
    "AWS_SEC_ACC_KEY": "AWS SECRET ACCESS KEY",
    "AWS_REGION": "AWS REGION",
    "LAMBDA_SECRET_KEY": "YOUR SECRET TOKEN FOR LAMBDA REQUESTS",
    "CALIBRATION_LENGTH": 150,
    "SAMPLE_TIME": <THE NUMBER OF SECONDS THE SENSOR TAKES SAMPLES>,
    "MIN_GAIT_CYCLES": 7,
    "STD_DEVIATIONS_FACTOR": 5,
    "SSL_KEY_PATH": "",
    "SSL_CERT_PATH": "",
    "GRAPHS_SIMILARITY_TRESHOLD": 350,
    "PEAKS_FILTER_TRESHOLD": 4.5
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
[Server URL](https://safewalk.company/api)

## Built With

* [Node.js](http://www.dropwizard.io/1.0.2/docs/) - Programming language
* [C++](http://www.cplusplus.com/) - Programming language used for Arduino embedded code
* [AWS Lambda Functions](https://docs.aws.amazon.com/lambda/index.html) - Heavy computations made with Serverless technology
* [AWS EC2](https://aws.amazon.com/ec2/) - Application server
* [Redis](https://redis.io) - Cache mechanism
* [Express](https://expressjs.com/) - Web framework
* [Socket.IO](https://socket.io/) - Server notifications
* [PM2](https://pm2.keymetrics.io/) - Process manager
* [Dynamic time warping](https://www.npmjs.com/package/dynamic-time-warping) - Algorithm used for detection of differences between time sequences
* [Mongo DB](https://www.mongodb.com/) - Application database
* [Winston](https://github.com/winstonjs/winston) - Logs management
* [Slayer](https://www.npmjs.com/package/slayer) - Algorithm used for detection of peaks in a time sequence
* [AHRS - Madgwick](https://www.npmjs.com/package/ahrs) - Sensor fusion
* [JWT](https://www.npmjs.com/package/jsonwebtoken) - Token based authentication management
* [Arduino Nano 33 IOT](https://store.arduino.cc/arduino-nano-33-iot) - Computing unit with an IMU sensor for human walking measurement

## Authors

* **Idan Asulin**
* **Avraham Neeman**
* **Yaniv Ziperfal**
