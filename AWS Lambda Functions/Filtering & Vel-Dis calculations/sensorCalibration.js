module.exports = (rawData, calibrationLength) => {
    let countX = 0, countY = 0, countZ = 0, count_gyr_X = 0, count_gyr_Y = 0, count_gyr_Z = 0;
    for (let index = 0; index < calibrationLength; index++) {
        countX += rawData[index].xA - 1;
        countY += rawData[index].yA;
        countZ += rawData[index].zA;
        count_gyr_X += rawData[index].xG;
        count_gyr_Y += rawData[index].yG;
        count_gyr_Z += rawData[index].zG;
    }
    return {
        calibration_acc_x: countX / calibrationLength,
        calibration_acc_y: countY / calibrationLength,
        calibration_acc_z: countZ / calibrationLength,
        calibration_gyro_x: count_gyr_X / calibrationLength,
        calibration_gyro_y: count_gyr_Y / calibrationLength,
        calibration_gyro_z: count_gyr_Z / calibrationLength
    };
};