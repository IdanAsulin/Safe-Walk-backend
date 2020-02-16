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
            done: { type: Boolean, default: false }
        }],
        validate: {
            validator: videos => videos.length > 0,
            message: props => `${props.value} must contains at least 1 video`
        }
    },
    lastModified: { type: Date, default: new Date() },
    instructions: {
        type: String,
        default: ""
    },
    therapistID: { type: String },
    defaultPlans: { type: [String], default: [] },
    type: {
        type: String,
        enum: ['defaultPlan', 'rehabPlan'],
        required: true
    }
});

module.exports = mongoose.model('plan', planSchema);