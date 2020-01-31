const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
    },
    mail: {
        type: String,
        required: true
    },
    password: { type: String, required: true },
    picture: { type: String, required: true },
    type: {
        type: String,
        enum: ['patient', 'therapist'],
        required: true
    },
    patientID: { type: String, default: "" },
    therapistID: { type: String, default: "" },
    disabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('user', userSchema);