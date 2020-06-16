const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    description: String,
    timeStamp: Date,
    patientPicture: String
});

module.exports = mongoose.model('notification', notificationSchema);