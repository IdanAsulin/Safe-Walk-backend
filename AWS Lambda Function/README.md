# Lambda Function

## Lambda Function - GaitCycleDetectionAndCalculations
This AWS Lambda function is responsible for the heavy calculations made on the sensors output.
In this Lambda all of the following actions take place:
    1. Sensor calibration
    2. Gravity vector removal (sensor fusion - includes orientation calculations)
    3. Noise cleaning (using moving average filter)
    4. Accelerations & Velocities & Displacements calculations (achieved by kinematic equations - first and second integrations)
    5. Gait cycle detection
    6. Comparison between normal gait model to the sampled gait cycle

Finally that Lambda will output 2 things:
    1. failureObserved - Boolean which indicates whether a failure detected during the gait cycle
    2. report - String which contains all points inside the sampled gait cycle with estimation of the deviation

## Gait calculations utils for internal use

This fo;der contains a script to calculate the normal gait model. In addition you will find a JSON file contains samples of gait cycle (only vertical axis)