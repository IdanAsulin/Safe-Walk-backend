const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const rawDataStructure = {
    timeStamp: { type: Number, required: true },
    angle: { type: Number, required: true }
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
    sensor1: { type: [rawDataStructure], default: [] },
    sensor2: { type: [rawDataStructure], default: [] },
    sensor3: { type: [rawDataStructure], default: [] },
    sensor4: { type: [rawDataStructure], default: [] },
    sensor5: { type: [rawDataStructure], default: [] },
    sensor6: { type: [rawDataStructure], default: [] },
    sensor7: { type: [rawDataStructure], default: [] }
});

module.exports = mongoose.model('patientGaitModel', patientGaitModelSchema);