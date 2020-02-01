const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;
function checkEmail(email) {
    const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegEx.test(email);
};

const userSchema = new Schema({
    id: {
        type: String,
        default: uuidv4()
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
    picture: { type: String, required: false, default: '' },
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