const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const rawDataStructure = {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
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
    sensor1RawData: { type: [rawDataStructure], required: true },
    sensor2RawData: { type: [rawDataStructure], required: true },
    sensor3RawData: { type: [rawDataStructure], required: true },
    sensor4RawData: { type: [rawDataStructure], required: true },
    sensor5RawData: { type: [rawDataStructure], required: true },
    sensor6RawData: { type: [rawDataStructure], required: true },
    sensor7RawData: { type: [rawDataStructure], required: true }
});

module.exports = mongoose.model('patientGaitModel', patientGaitModelSchema);