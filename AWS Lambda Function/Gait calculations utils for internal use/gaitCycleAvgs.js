const samples = require('./thigh(10 samples).json');
const math = require('mathjs');
const fs = require('fs');

const numOfSamples = samples.length;
let sumOfCycleLengths = 0
for (let sample of samples)
    sumOfCycleLengths += sample.length;
const avgOfCycleLengths = Math.round(sumOfCycleLengths / numOfSamples);

const normalCycle = [];
const stdDeviations = [];
for (let i = 0; i < avgOfCycleLengths; ++i) {
    let sum = 0, count = 0;
    const currentIndexValues = [];
    for (let j = 0; j < numOfSamples; ++j) {
        if (samples[j][i]) {
            count++;
            sum += samples[j][i].value;
            currentIndexValues.push(samples[j][i].value);
        }
    }
    normalCycle.push(Number((sum / count).toFixed(3)));
    const stdDeviation = Number(math.std(currentIndexValues).toFixed(3));
    stdDeviations.push(stdDeviation);
}

fs.writeFileSync('normal_cycle.json', JSON.stringify(normalCycle));
fs.writeFileSync('standard_deviations.json', JSON.stringify(stdDeviations));