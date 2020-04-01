const request = require('request-promise');
const KalmanFilter = require('kalmanjs');

const kf_X = new KalmanFilter();
const kf_Y = new KalmanFilter();
const kf_Z = new KalmanFilter();

const serverURL = "http://ec2-3-89-190-108.compute-1.amazonaws.com:3000/api";
const LAMBDA_SECRET = '<LAMBDA SECRET KEY>';
const GRAVITY = 9.80665;

exports.handler = async (event, context, callback) => {
    const rawData = event.accelerations;
    let cal_x = 0;
    let cal_y = 0;
    let cal_z = 0;
    for (let index = 0; index < event.CALIBRATION_LENGTH; ++index) {
        cal_x += rawData[index].xA;
        cal_y += rawData[index].yA;
        cal_z += rawData[index].zA;
    }
    const CAL_X = cal_x / event.CALIBRATION_LENGTH;
    const CAL_Y = cal_y / event.CALIBRATION_LENGTH;
    const CAL_Z = cal_z / event.CALIBRATION_LENGTH;
    /* Converting acceleration into m/s^2 units */
    const accelerations = rawData.map((item, index) => {
        const x_acc = Number((item.xA - CAL_X).toFixed(2));
        const y_acc = Number((item.yA - CAL_Y).toFixed(2));
        const z_acc = Number((item.zA - CAL_Z).toFixed(2));
        const x = Number(kf_X.filter(x_acc * GRAVITY).toFixed(3));
        const y = Number(kf_Y.filter(y_acc * GRAVITY).toFixed(3));
        const z = Number(kf_Z.filter(z_acc * GRAVITY).toFixed(3));
        return {
            timeStamp: index,
            x: x,
            y: y,
            z: z
        }
    });
    const frequency = rawData.length / event.SAMPLE_TIME;
    const timeDelta = 1 / frequency;
    let old_velocity_X = 0;
    let old_velocity_Y = 0;
    let old_velocity_Z = 0;
    let old_displacement_X = 0;
    let old_displacement_Y = 0;
    let old_displacement_Z = 0;
    const velocities = [];
    const displacements = [];
    let total_vel_x = 0;
    let total_vel_y = 0;
    let total_vel_z = 0;
    /* Calculating first integration to get the velocity in m/s units */
    for (let raw of accelerations) {
        if (Math.abs(raw.x) >= 0.2)
            old_velocity_X = Number((old_velocity_X + raw.x * timeDelta).toFixed(3));
        else if (Math.abs(raw.x) >= 0.1)
            old_velocity_X = Number((old_velocity_X + 0.05 * raw.x * timeDelta).toFixed(3));
        if (Math.abs(raw.y) >= 0.2)
            old_velocity_Y = Number((old_velocity_Y + raw.y * timeDelta).toFixed(3));
        else if (Math.abs(raw.y) >= 0.1)
            old_velocity_Y = Number((old_velocity_Y + 0.05 * raw.y * timeDelta).toFixed(3));
        if (Math.abs(raw.z) >= 0.2)
            old_velocity_Z = Number((old_velocity_Z + raw.z * timeDelta).toFixed(3));
        else if (Math.abs(raw.z) >= 0.1)
            old_velocity_Z = Number((old_velocity_Z + 0.05 * raw.z * timeDelta).toFixed(3));
        velocities.push({
            timeStamp: raw.timeStamp,
            x: old_velocity_X,
            y: old_velocity_Y,
            z: old_velocity_Z
        });
        total_vel_x += old_velocity_X;
        total_vel_y += old_velocity_Y;
        total_vel_z += old_velocity_Z;
    }
    const avg_vel_x = Number((total_vel_x / velocities.length).toFixed(3));
    const avg_vel_y = Number((total_vel_y / velocities.length).toFixed(3));
    const avg_vel_z = Number((total_vel_z / velocities.length).toFixed(3));
    /* Calculating second integral to get the displacement in cm units */
    for (let velocity of velocities) {
        if (Math.abs(avg_vel_x) >= 0.02) {
            if (Math.abs(velocity.x) >= 0.07)
                old_displacement_X = old_displacement_X + velocity.x * timeDelta;
            else if (Math.abs(velocity.x) >= 0.05)
                old_displacement_X = old_displacement_X + 0.01 * velocity.x * timeDelta;
        }
        else {
            if (Math.abs(avg_vel_x) >= 0.01) {
                if (Math.abs(velocity.x) > 0.025)
                    old_displacement_X = old_displacement_X + velocity.x * timeDelta;
                else if (Math.abs(velocity.x) >= 0.01)
                    old_displacement_X = old_displacement_X + 0.01 * velocity.x * timeDelta;
            }
        }
        if (Math.abs(avg_vel_y) >= 0.02) {
            if (Math.abs(velocity.y) >= 0.07)
                old_displacement_Y = old_displacement_Y + velocity.y * timeDelta;
            else if (Math.abs(velocity.y) >= 0.05)
                old_displacement_Y = old_displacement_Y + 0.01 * velocity.y * timeDelta;
        }
        else {
            if (Math.abs(avg_vel_y) >= 0.01) {
                if (Math.abs(velocity.y) > 0.025)
                    old_displacement_Y = old_displacement_Y + velocity.y * timeDelta;
                else if (Math.abs(velocity.y) >= 0.01)
                    old_displacement_Y = old_displacement_Y + 0.01 * velocity.y * timeDelta;
            }
        }
        if (Math.abs(avg_vel_z) >= 0.02) {
            if (Math.abs(velocity.z) >= 0.07)
                old_displacement_Z = old_displacement_Z + velocity.z * timeDelta;
            else if (Math.abs(velocity.z) >= 0.05)
                old_displacement_Z = old_displacement_Z + 0.01 * velocity.z * timeDelta;
        }
        else {
            if (Math.abs(avg_vel_z) >= 0.01) {
                if (Math.abs(velocity.z) > 0.025)
                    old_displacement_Z = old_displacement_Z + velocity.z * timeDelta;
                else if (Math.abs(velocity.z) >= 0.01)
                    old_displacement_Z = old_displacement_Z + 0.01 * velocity.z * timeDelta;
            }
        }
        displacements.push({
            timeStamp: velocity.timeStamp,
            x: old_displacement_X * 100,
            y: old_displacement_Y * 100,
            z: old_displacement_Z * 100
        });
    }
    const options = {
        url: `${serverURL}/patientGaitModel/${event.TEST_ID}`,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': LAMBDA_SECRET
        },
        body: {
            sensorName: event.SENSOR_NAME,
            accelerations: accelerations,
            velocities: velocities,
            displacements: displacements
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