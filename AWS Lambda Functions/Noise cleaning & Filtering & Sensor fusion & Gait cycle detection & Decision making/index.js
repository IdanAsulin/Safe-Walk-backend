const request = require('request-promise');
const slayer = require('slayer');
const AHRS = require('ahrs');
const math = require('mathjs');
const DynamicTimeWarping = require('dynamic-time-warping');
const movingAvgFilter = require('./movingAvgFilter');
const sensorCalibration = require('./sensorCalibration');
const normalThighCycle = require('./normal_thigh_cycle.json');
const thighStdDeviations = require('./thigh_standard_deviations.json');

const serverURL = "http://ec2-3-89-190-108.compute-1.amazonaws.com:3000/api";
const LAMBDA_SECRET = 'YanIv_!2#4IdaN__--AvI';
const GRAVITY = 9.80665;

exports.handler = async (event, context, callback) => {
    const rawData = event.RAW_DATA;
    const frequency = rawData.length / event.SAMPLE_TIME;
    const madgwick = new AHRS({
        sampleInterval: (1 / frequency) * 1000,
        algorithm: 'Madgwick',
        beta: 0.0001
    });

    /* Sensor calibration values */
    const { calibration_gyro_x, calibration_gyro_y, calibration_gyro_z, calibration_acc_x, calibration_acc_y, calibration_acc_z } = sensorCalibration(rawData, event.CALIBRATION_LENGTH);

    /* Gravity vector of the first sensor orientation */
    const xGravity = rawData[0].xA - calibration_acc_x;
    const yGravity = rawData[0].yA - calibration_acc_y;
    const zGravity = rawData[0].zA - calibration_acc_z;

    /* Assumes that the first sample was taken when the sensor is already located and in a static mode */
    const gravityVector = math.matrix([
        [Number(xGravity.toFixed(3))],
        [Number(yGravity.toFixed(3))],
        [Number(zGravity.toFixed(3))]
    ]);

    /* Gravity removal */
    const gravityRemoved = [];
    for (let raw of rawData) {

        /* Calibration substruction */
        const acc_x_calibrated = raw.xA - calibration_acc_x;
        const acc_y_calibrated = raw.yA - calibration_acc_y;
        const acc_z_calibrated = raw.zA - calibration_acc_z;
        const gyro_x_calibrated = raw.xG - calibration_gyro_x;
        const gyro_y_calibrated = raw.yG - calibration_gyro_y;
        const gyro_z_calibrated = raw.zG - calibration_gyro_z;

        /* Converting gyro measurements into radians per second units */
        const degreesToRadians = Math.PI / 180;
        const gyro_x = Number((gyro_x_calibrated * degreesToRadians).toFixed(2));
        const gyro_y = Number((gyro_y_calibrated * degreesToRadians).toFixed(2));
        const gyro_z = Number((gyro_z_calibrated * degreesToRadians).toFixed(2));

        /* Euler angles calculation in order to estimate sensor orientation */
        madgwick.update(gyro_x, gyro_y, gyro_z, acc_x_calibrated, acc_y_calibrated, acc_z_calibrated);
        const angle = madgwick.getEulerAngles(); // in radians
        let heading = angle.heading ? angle.heading : 0;
        let pitch = angle.pitch ? angle.pitch : 0;
        let roll = angle.roll ? angle.roll : 0;

        /* Rotation matrix components calculation */
        const a11 = Math.cos(heading) * Math.cos(pitch);
        const a12 = Math.cos(heading) * Math.sin(pitch) * Math.sin(roll) - Math.sin(heading) * Math.cos(roll);
        const a13 = Math.cos(heading) * Math.sin(pitch) * Math.cos(roll) + Math.sin(heading) * Math.sin(roll);
        const a21 = Math.sin(heading) * Math.cos(pitch);
        const a22 = Math.sin(heading) * Math.sin(pitch) * Math.sin(roll) + Math.cos(heading) * Math.cos(roll);
        const a23 = Math.sin(heading) * Math.sin(pitch) * Math.cos(roll) - Math.cos(heading) * Math.sin(roll);
        const a31 = -Math.sin(pitch);
        const a32 = Math.cos(pitch) * Math.sin(roll);
        const a33 = Math.cos(pitch) * Math.cos(roll);
        if (a31 < -0.99 && a31 >= -1) {
            pitch = Math.PI / 2;
            roll = Math.atan2(a12, a13) + heading;
        }
        else if (a31 > 0.99 && a31 <= 1) {
            pitch = -Math.PI / 2;
            roll = Math.atan2(-a12, -a13) - heading;
        }
        else {
            pitch = Math.asin(-a31);
            if (pitch > -Math.PI / 2 && pitch < Math.PI / 2) {
                roll = Math.atan2(a32, a33);
                heading = Math.atan2(a21, a11);
            }
            if (pitch > Math.PI / 2 && pitch < 3 * Math.PI / 2) {
                roll = Math.atan2(-a32, -a33);
                heading = Math.atan2(-a21, -a11);
            }
        }
        const rotationMatrix = math.matrix([
            [a11, a12, a13],
            [a21, a22, a23],
            [a31, a32, a33]
        ]);

        /* Rotate the gravity vector in order to substruct it from the acceleration measurements */
        const results = math.multiply(rotationMatrix, gravityVector);
        const rotated_gravity_X = results._data[0][0];
        const rotated_gravity_Y = results._data[1][0];
        const rotated_gravity_Z = results._data[2][0];
        gravityRemoved.push({
            t: raw.t,
            xA: acc_x_calibrated - rotated_gravity_X,
            yA: acc_y_calibrated - rotated_gravity_Y,
            zA: acc_z_calibrated - rotated_gravity_Z
        });
    }

    /* Cleaning noises */
    const filteredAccelerations = movingAvgFilter(gravityRemoved);

    const accelerations = [];
    const accelerations_x = [];

    /* Save the acceleration in m/s^2 units */
    for (let filteredAcc of filteredAccelerations) {
        const index = filteredAcc.timeStamp;
        accelerations.push({
            timeStamp: index,
            x: Number((filteredAcc.x * GRAVITY).toFixed(3)),
            y: Number((filteredAcc.y * GRAVITY).toFixed(3)),
            z: Number((filteredAcc.z * GRAVITY).toFixed(3))
        });
        accelerations_x.push(accelerations[index].x); // In order to detect the gait cycle
    }

    try {

        /* Extracting the gait cycle by finding acceleration measurements peaks on the x axis */
        const slayerOptions = {
            minPeakHeight: 4.5, // filter all peaks less than 4.5 m/s^2 (treshold to identify start of a new gait cycle)
            minPeakDistance: 100 // at least with 100 samples between peaks (treshold of the interval between cycles - helps us to ignore peaks in between cycles)
        };
        let spikes = await slayer(slayerOptions).fromArray(accelerations_x);
        if (spikes.length < event.MIN_GAIT_CYCLES) {
            const error = {
                statusCode: 400,
                message: `You have to sample at least ${event.MIN_GAIT_CYCLES} gait cycles`
            };
            return callback(null, error);
        }
        const chosenCycleIndex = Math.floor(event.MIN_GAIT_CYCLES / 2); // Choosing the middle gait cycle
        const start = spikes[chosenCycleIndex].x - 30; // 30 samples before the peak
        const end = spikes[chosenCycleIndex + 1].x + 3; // gait cycle end - the start of the next cycle
        const cycle_accs = [];
        let index = 0;
        for (let i = start; i <= end; ++i) {
            cycle_accs.push({
                timeStamp: index++,
                x: accelerations[i].x,
                y: accelerations[i].y,
                z: accelerations[i].z
            });
        }

        const timeDelta = 1 / frequency;
        const velocities = [];
        let old_velocity_X = 0;
        let old_velocity_Y = 0;
        let old_velocity_Z = 0;

        /* Calculating first integration to get the velocity in m/s units - velocity = old + a*dt */
        for (let acc of cycle_accs) {
            old_velocity_X = Number((old_velocity_X + acc.x * timeDelta).toFixed(3));
            old_velocity_Y = Number((old_velocity_Y + acc.y * timeDelta).toFixed(3));
            old_velocity_Z = Number((old_velocity_Z + acc.z * timeDelta).toFixed(3));
            velocities.push({
                timeStamp: acc.timeStamp,
                x: old_velocity_X,
                y: old_velocity_Y,
                z: old_velocity_Z
            });
        }

        let old_displacement_X = 0;
        let old_displacement_Y = 0;
        let old_displacement_Z = 0;
        const displacements = [];

        /* Calculating second integration to get the displacement in m units - displacement = old + v*dt */
        for (let velocity of velocities) {
            old_displacement_X = Number((old_displacement_X + velocity.x * timeDelta).toFixed(3));
            old_displacement_Y = Number((old_displacement_Y + velocity.y * timeDelta).toFixed(3));
            old_displacement_Z = Number((old_displacement_Z + velocity.z * timeDelta).toFixed(3));
            displacements.push({
                timeStamp: velocity.timeStamp,
                x: old_displacement_X,
                y: old_displacement_Y,
                z: old_displacement_Z
            });
        }

        /* Checking for similarity between the normal measurements to the abnormal ones */
        const distFunc = (a, b) => {
            return Math.abs(a - b.x);
        };

        const dtw = new DynamicTimeWarping(normalThighCycle, cycle_accs, distFunc);
        const dist = dtw.getDistance();
        const path = dtw.getPath(); // Returns match between points in the normal cycle and the sampled one

        /* Important stages of the gait cycles - the numbers represents the index of them inside the normal cycle */
        const start_hill_strike = 18, end_hill_strike = 20, start_mid_stance = 35, end_mid_stance = 38, start_toe_off = 44, end_toe_off = 46;
        let report = '';

        /* Detecting failures in the patient's gait cycle */
        const gaitExceptions = [];
        for (let i = 0; i < path.length; ++i) {
            const normal_cycle_index = path[i][0];
            if (normal_cycle_index < 10 || normal_cycle_index > 137) continue; // Skipping the first and the last samples which are pre & post the gait cycle
            const sample_index = path[i][1];
            if (gaitExceptions.indexOf(sample_index) !== -1) continue; // Skipping exceptions which already have been detected
            const difference = distFunc(normalThighCycle[normal_cycle_index], cycle_accs[sample_index]);
            const stdDeviation = thighStdDeviations[normal_cycle_index];
            const failureRate = event.STD_DEVIATIONS_FACTOR * stdDeviation;
            if (difference > failureRate) {
                gaitExceptions.push(sample_index);
                const exception = Number((difference / stdDeviation).toFixed(2));
                if (normal_cycle_index >= start_hill_strike && normal_cycle_index <= end_hill_strike) {
                    report += `An exception of ${exception} standard deviations was detected in the Hill Strike stage (sample #${sample_index})\n`;
                    continue;
                }
                if (normal_cycle_index >= start_mid_stance && normal_cycle_index <= end_mid_stance) {
                    report += `An exception of ${exception} standard deviations was detected in the Mid Stance stage (sample #${sample_index})\n`;
                    continue;
                }
                if (normal_cycle_index >= start_toe_off && normal_cycle_index <= end_toe_off) {
                    report += `An exception of ${exception} standard deviations was detected in the Toe Off stage (sample #${sample_index})\n`;
                    continue;
                }
                report += `An exception of ${exception} standard deviations was detected (sample #${sample_index})\n`;
            }
        }
        let failureObserved = false;
        if (gaitExceptions.length > 0) {
            failureObserved = true;
            report = `The following ${gaitExceptions.length} deviations have been detected:\n${report.trim()}`;
        }
        else
            report = `No gait pattern failures have been detected`;

        /* Send the results to the application server */
        let options = {
            url: `${serverURL}/patientGaitModel/${event.TEST_ID}`,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': LAMBDA_SECRET
            },
            body: {
                sensorName: event.SENSOR_NAME,
                accelerations: cycle_accs,
                velocities: velocities,
                displacements: displacements
            },
            simple: true,
            resolveWithFullResponse: true,
            json: true
        };
        let response = await request.put(options);
        if (response.statusCode !== 200) {
            const error = {
                statusCode: response.statusCode,
                message: response.body
            };
            return callback(null, error);
        }


        /* Update the test entity */
        options.url = `${serverURL}/test/${event.TEST_ID}`;
        options.body = {
            abnormality: failureObserved,
            detailedDiagnostic: report
        };
        response = await request.put(options);
        if (response.statusCode !== 200) {
            const error = {
                statusCode: response.statusCode,
                message: response.body
            };
            return callback(null, error);
        }
        /* Update the patient entity */
        if (failureObserved) {
            options.url = `${serverURL}/patient/${event.PATIENT_ID}`;
            options.body = { waitForPlan: true };
            response = await request.put(options);
            if (response.statusCode !== 200) {
                const error = {
                    statusCode: response.statusCode,
                    message: response.body
                };
                return callback(null, error);
            }
        }
        const success = {
            statusCode: 200,
            failureObserved: failureObserved,
            report: report
        };
        return callback(null, success);
    } catch (ex) {
        const error = {
            statusCode: 500,
            message: ex.message
        };
        return callback(null, error);
    }
}