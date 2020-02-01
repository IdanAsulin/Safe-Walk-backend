const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const therapistSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true
    },
    patients: [String]
});

module.exports = mongoose.model('therapist', therapistSchema);