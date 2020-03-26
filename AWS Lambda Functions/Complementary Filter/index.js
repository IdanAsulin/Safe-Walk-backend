const request = require('request-promise');

const serverURL = "http://ec2-3-89-190-108.compute-1.amazonaws.com:3000/api";
const LAMBDA_SECRET = '<SECRET LAMBDA KEY>';

exports.handler = async (event, context, callback) => {
    const timeDifference = 1 / event.SAMPLE_RATE_HZ;
    const hpf = event.HIGH_PASS_FILTER;
    const lpf = event.LOW_PASS_FILTER;
    // const degreesToRadians = Math.PI / 180;
    const radiansToDegrees = 180 / Math.PI;
    let roll_angle_x = 0;
    let pitch_angle_y = 0;
    let yaw_angle_z = 0;
    const anglesArray = [];
    for (let raw of event.rawData) {
        const acc_roll_angle = Math.atan2(raw.zA, raw.yA);
        const acc_pitch_angle = Math.atan2(raw.xA, raw.zA);
        const acc_yaw_angle = Math.atan2(raw.yA, raw.xA);
        roll_angle_x = hpf * roll_angle_x + raw.xG * timeDifference + lpf * acc_roll_angle;
        pitch_angle_y = hpf * pitch_angle_y + raw.yG * timeDifference + lpf * acc_pitch_angle;
        yaw_angle_z = hpf * yaw_angle_z + raw.zG * timeDifference + lpf * acc_yaw_angle;
        anglesArray.push({
            timeStamp: raw.t,
            roll_angle_x: roll_angle_x,
            pitch_angle_y: pitch_angle_y,
            yaw_angle_z: yaw_angle_z
        });
    }
    anglesArray.splice(0,150); // delete the first 150 samples for sensor fusion needs 
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