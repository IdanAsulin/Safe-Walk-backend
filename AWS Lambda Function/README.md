# Lambda Function

## Lambda Function - GaitCycleDetectionAndCalculations
This AWS Lambda function is responsible for the heavy calculations made on the sensors output.
In this Lambda all of the following actions take place:<br/>
1. Sensor calibration<br/>
2. Gravity vector removal (sensor fusion - includes orientation calculations)<br/>
3. Noise cleaning (using moving average filter)<br/>
4. Accelerations & Velocities & Displacements calculations (achieved by kinematic equations - first and second integrations)<br/>
5. Gait cycle detection<br/>
6. Comparison between normal gait model to the sampled gait cycle<br/>

Finally that Lambda will output 2 things:<br/>
1. failureObserved - Boolean which indicates whether a failure detected during the gait cycle<br/>
2. report - String which contains all points inside the sampled gait cycle with estimation of the deviation<br/>

## Gait calculations utils for internal use

This folder contains a script to calculate the normal gait model. In addition you will find a JSON file contains samples of gait cycle used to calculate the normal model (only vertical (X) axis)