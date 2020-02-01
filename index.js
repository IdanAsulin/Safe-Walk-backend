const express = require('express');
const Joi = require('joi');
const morgan = require('morgan');
require('./dbConnection');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :response-time ms'));

app.listen(port, () => console.log(`Listening on port: ${port}`));