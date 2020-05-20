const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const testSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    date: {
        type: Date,
        default: new Date()
    },
    patientID: { type: String, required: true },
    abnormality: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('test', testSchema);