const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const rawDataStructure = {
    timeStamp: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
};

const sensorData = {
    accelerations: { type: [rawDataStructure], default: [] },
    velocities: { type: [rawDataStructure], default: [] },
    displacements: { type: [rawDataStructure], default: [] }
};

const patientGaitModelSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    testID: {
        type: String,
        required: true
    },
    sensor1: sensorData,
    sensor2: sensorData,
    sensor3: sensorData,
    sensor4: sensorData,
    sensor5: sensorData,
    sensor6: sensorData,
    sensor7: sensorData
});

module.exports = mongoose.model('patientGaitModel', patientGaitModelSchema);