require('./dbConnection');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { validateRequestBody } = require('./middlewares');
const logger = require('./logger');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
    res.header("HTTP/1.1 200 OK");
    res.set("Content-Type", "application/json");
    next();
});
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :remote-addr -- :response-time ms', { 'stream': logger.stream }));
app.use(validateRequestBody);

app.use('/api/defaultPlan', require('./routes/defaultPlan'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/patientGaitModel', require('./routes/patientGaitModel'));
app.use('/api/rehabPlan', require('./routes/rehabPlan'));
app.use('/api/sensorsKit', require('./routes/sensorKit'));
app.use('/api/test', require('./routes/test'));
app.use('/api/therapist', require('./routes/therapist'));
app.use('/api/video', require('./routes/video'));
app.use('/api/auth', require('./routes/auth'));
app.all('*', (req, res) => res.status(404).json({ message: `Endpoint not found` }));

app.listen(port, () => logger.info(`Listening on port: ${port}`));