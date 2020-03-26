const request = require('request-promise');

const serverURL = "http://ec2-3-89-190-108.compute-1.amazonaws.com:3000/api";
const LAMBDA_SECRET = 'YanIv_!2#4IdaN__--AvI';

exports.handler = async (event, context, callback) => {
    const timeDifference = 1 / event.SAMPLE_RATE_HZ;
    const hpf = event.HIGH_PASS_FILTER;
    const lpf = event.LOW_PASS_FILTER;
    // const degreesToRadians = Math.PI / 180;
    const radiansToDegrees = 180 / Math.PI;
    let pitch_angle_x = 0;
    let roll_angle_y = 0;
    let yaw_angle_z = 0;
    const anglesArray = [];
    for (let raw of event.rawData) {
        const accAnglePitch = Math.atan2(raw.xA, Math.sqrt((raw.yA * raw.yA) + (raw.zA * raw.zA))) * radiansToDegrees;
        const accAngleRoll = Math.atan2(raw.yA, Math.sqrt((raw.xA * raw.xA) + (raw.zA * raw.zA))) * radiansToDegrees;
        const accAngleYaw = Math.atan2(raw.zA, Math.sqrt((raw.xA * raw.xA) + (raw.yA * raw.yA))) * radiansToDegrees;
        const gyroAnglePitch = pitch_angle_x + (raw.yG * timeDifference);
        const gyroAngleRoll = roll_angle_y + (raw.xG * timeDifference);
        const gyroAngleYaw = yaw_angle_z + (raw.xG * timeDifference);
        pitch_angle_x = ((hpf * gyroAnglePitch) + (lpf * accAnglePitch));
        roll_angle_y = ((hpf * gyroAngleRoll) + (lpf * accAngleRoll));
        yaw_angle_z = ((hpf * gyroAngleYaw) + (lpf * accAngleYaw));
        anglesArray.push({
            timeStamp: raw.t,
            pitch_angle_x: pitch_angle_x,
            roll_angle_y: roll_angle_y,
            yaw_angle_z: yaw_angle_z
        });
    }
    const options = {
        url: `${serverURL}/patientGaitModel/${event.testID}`,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': LAMBDA_SECRET
        },
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