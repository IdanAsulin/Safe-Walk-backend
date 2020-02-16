const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const { checkEmail } = require('../utils');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true,
        validate: {
            validator: email => checkEmail(email),
            message: props => `${props.value} is not a valid email address`
        }
    },
    password: { type: String, required: true },
    picture: { type: String, required: true, default: '' },
    phoneNumber: { type: String, required: true },
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