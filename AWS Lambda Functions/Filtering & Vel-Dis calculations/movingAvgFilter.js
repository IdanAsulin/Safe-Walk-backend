module.exports = rawData => {
    const filteredData = new Array(rawData.length);

    for (let index = 0; index < rawData.length; index++) {
        if (index === 0) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index].xA + rawData[index + 1].xA) / 2,
                y: (rawData[index].yA + rawData[index + 1].yA) / 2,
                z: (rawData[index].zA + rawData[index + 1].zA) / 2
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === rawData.length - 1) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 1].xA + rawData[index].xA) / 2,
                y: (rawData[index - 1].yA + rawData[index].yA) / 2,
                z: (rawData[index - 1].zA + rawData[index].zA) / 2
            };
            filteredData[index] = filteredObj;
            continue;
        }
        const filteredObj = {
            timeStamp: index,
            x: (rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA) / 3,
            y: (rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA) / 3,
            z: (rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA) / 3
        };
        filteredData[index] = filteredObj;
    }
    return filteredData;
};