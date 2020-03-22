const request = require('request-promise');

const serverURL = "http://ec2-3-89-190-108.compute-1.amazonaws.com:3000/api";

exports.handler = async (event, context, callback) => {
    const timeDifference = 1 / event.SAMPLE_RATE_HZ;
    const hpf = event.HIGH_PASS_FILTER;
    const lpf = event.LOW_PASS_FILTER;
    // const degreesToRadians = Math.PI / 180;
    const radiansToDegrees = 180 / Math.PI;
    let angle = 0;
    const anglesArray = [];
    for (let raw of event.rawData) {
        const accAngle = Math.atan2(raw.xA, Math.sqrt((raw.yA * raw.yA) + (raw.zA * raw.zA))) * radiansToDegrees;
        const gyr_y = raw.yG;
        const gyroAngle = angle + (gyr_y * timeDifference);
        angle = ((hpf * gyroAngle) + (lpf * accAngle));
        anglesArray.push({ timeStamp: raw.t, angle: angle });
    }
    const options = {
        url: `${serverURL}/patientGaitModel/${event.testID}`,
        'headers': { 'Content-Type': 'application/json' },
        body: {
            sensorName: event.sensorName,
            rawData: anglesArray
        },
        simple: true,
        resolveWithFullResponse: true,
        json: true
    };
    try {
        const response = await request.put(options);
        if (response.statusCode !== 200) {
            const error = {
                statusCode: response.statusCode,
                message: response.body
            };
            return callback(null, error);
        }
        const success = {
            statusCode: 200,
            message: 'Ok'
        };
        return callback(null, success);
    } catch (ex) {
        const error = {
            statusCode: 500,
            message: ex.message
        };
        return callback(null, error);
    }
};