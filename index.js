require('./dbConnection');
const express = require('express');
const defaultPlan = require('./routes/defaultPlan');
const patient = require('./routes/patient');
const patientGaitModel = require('./routes/patientGaitModel');
const rehabPlan = require('./routes/rehabPlan');
const sensorKit = require('./routes/sensorKit');
const test = require('./routes/test');
const therapist = require('./routes/therapist');
const video = require('./routes/video');
const auth = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/defaultPlan', defaultPlan);
app.use('/api/patient', patient);
app.use('/api/patientGaitModel', patientGaitModel);
app.use('/api/rehabPlan', rehabPlan);
app.use('/api/sensorKit', sensorKit);
app.use('/api/test', test);
app.use('/api/therapist', therapist);
app.use('/api/video', video);
app.use('/auth', auth);

app.listen(port, () => console.log(`Listening on port: ${port}`));