const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const defaultPlanSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true
    },
    videos: {
        type: [String],
        validate: {
            validator: videos => videos.length > 2,
            message: props => `${props.value} must contains at least 1 video`
        }
    },
    instructions: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('defaultPlan', defaultPlanSchema);