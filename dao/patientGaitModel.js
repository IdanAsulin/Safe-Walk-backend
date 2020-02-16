const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const patientGaitModelSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    testID: {
        type: String,
        required: true
    },
    kitID: { type: String, required: true },
    sensorsOutput: [{
        sensorLocation: { type: Number, required: true, min: 1, max: 7 },
        rawData: [{
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true }
        }]
    }]
});

module.exports = mongoose.model('patientGaitModel', patientGaitModelSchema);