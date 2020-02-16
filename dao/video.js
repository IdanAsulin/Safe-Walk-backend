const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const videoSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true
    },
    duration: { type: Number, min: 0, required: true },
    link: { type: String, required: true }
});

module.exports = mongoose.model('video', videoSchema);