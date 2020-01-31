const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;

const sensorsKitSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
    },
    patientID: {
        type: String,
        required: true
    },
    IPs: {
        type: {
            sensor1: { type: String, required: true, default: "" },
            sensor2: { type: String, required: true, default: "" },
            sensor3: { type: String, required: true, default: "" },
            sensor4: { type: String, required: true, default: "" },
            sensor5: { type: String, required: true, default: "" },
            sensor6: { type: String, required: true, default: "" },
            sensor7: { type: String, required: true, default: "" },
        }
    }
});

module.exports = mongoose.model('sensorsKit', sensorsKitSchema);