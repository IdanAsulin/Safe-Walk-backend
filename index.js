require('./dbConnection');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const morgan = require('morgan');
const { validateRequestBody } = require('./middlewares');
const logger = require('./logger');
const config = require('./config.json');
const fs = require('fs');
const io = require('socket.io');

const developmentPort = 3000;
const productionPort = 443;

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(cors());
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
app.use('/api/notification', require('./routes/notification'));
app.use('/api/auth', require('./routes/auth'));
app.all('*', (req, res) => res.status(404).json({ message: `Endpoint not found` }));

if (process.env.NODE_ENVIRONMENT === 'production') {
    const options = {
        key: fs.readFileSync(config.SSL_KEY_PATH),
        cert: fs.readFileSync(config.SSL_CERT_PATH)
    };
    const httpsServer = https.createServer(options, app);
    const socketIO = io(httpsServer);
    app.locals.socketIO = socketIO;
    httpsServer.listen(productionPort, () => logger.info(`Listening on port ${productionPort}`));
}
else {
    const httpServer = http.createServer(app);
    const socketIO = io(httpServer);
    app.locals.socketIO = socketIO;
    httpServer.listen(developmentPort, () => logger.info(`Listening on port: ${developmentPort}`));
}