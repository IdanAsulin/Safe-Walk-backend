const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const { checkIP } = require('../utils');

mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const sensorsKitSchema = new Schema({
    id: {
        type: String,
        default: uuidv4
    },
    IPs: {
        sensor1: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor2: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor3: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor4: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor5: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor6: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        },
        sensor7: {
            type: String,
            default: "0.0.0.0",
            validate: {
                validator: ip => checkIP(ip),
                message: props => `${props.value} is not a valid ip address`
            }
        }
    }
});

module.exports = mongoose.model('sensorsKit', sensorsKitSchema);