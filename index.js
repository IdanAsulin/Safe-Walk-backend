require('./dbConnection');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const defaultPlan = require('./routes/defaultPlan');
const patient = require('./routes/patient');
const patientGaitModel = require('./routes/patientGaitModel');
const rehabPlan = require('./routes/rehabPlan');
const sensorKit = require('./routes/sensorKit');
const test = require('./routes/test');
const therapist = require('./routes/therapist');
const video = require('./routes/video');
const auth = require('./routes/auth');
const { validateRequestBody } = require('./middlewares');
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(validateRequestBody);
app.use(morgan(':method :url :status :remote-addr -- :response-time ms', { 'stream': logger.stream }));

app.use('/api/defaultPlan', defaultPlan);
app.use('/api/patient', patient);
app.use('/api/patientGaitModel', patientGaitModel);
app.use('/api/rehabPlan', rehabPlan);
app.use('/api/sensorsKit', sensorKit);
app.use('/api/test', test);
app.use('/api/therapist', therapist);
app.use('/api/video', video);
app.use('/api/auth', auth);
app.all('*', (req, res) => res.status(404).json({ message: `Endpoint not found` }));

app.listen(port, () => logger.info(`Listening on port: ${port}`));