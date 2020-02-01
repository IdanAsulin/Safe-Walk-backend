const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const Schema = mongoose.Schema;
function checkIP(ip) {
    const ipRegEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegEx.test(ip);
};

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
        sensor1: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor2: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor3: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor4: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor5: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor6: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor7: {
            type: String,
            required: true,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        }
    }
});

module.exports = mongoose.model('sensorsKit', sensorsKitSchema);