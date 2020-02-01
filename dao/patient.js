const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true
    },
    birthDate: { type: Date, required: true },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    testsList: [{
        type: String,
        default: []
    }],
    waitForPlan: { type: Boolean, default: false },
    rehabPlanID: { type: String, default: "" },
    sensorsKitID: { type: String, required: true },
    therapistID: { type: String, required: true }
});

module.exports = mongoose.model('patient', patientSchema);