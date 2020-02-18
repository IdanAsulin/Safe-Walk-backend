const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const { checkEmail } = require('../utils');

const Schema = mongoose.Schema;

const therapistSchema = new Schema({
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
        required: true
    },
    password: { type: String, required: true },
    picture: { type: String, required: true },
    patients: [String]
});

module.exports = mongoose.model('therapist', therapistSchema);