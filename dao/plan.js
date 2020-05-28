const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const planSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true
    },
    patientID: { type: String },
    videos: {
        type: [{
            videoID: { type: String, required: true },
            times: { type: Number, default: 1, min: 1 },
            timesLeft: { type: Number, default: 0, min: 0 },
            done: { type: Boolean },
            priority: {
                type: String,
                enum: ['High', 'Low', 'Medium'],
                default: 'Medium'
            }
        }]
    },
    instructions: {
        type: String,
        default: ""
    },
    therapistID: String,
    type: {
        type: String,
        enum: ['defaultPlan', 'rehabPlan'],
        required: true
    },
    executionTime: String
});

module.exports = mongoose.model('plan', planSchema);