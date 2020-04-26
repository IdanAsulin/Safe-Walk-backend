module.exports = rawData => {
    const filteredData = new Array(rawData.length);
    for (let index = 0; index < rawData.length; index++) {
        if (index === 0) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index].xA + rawData[index + 1].xA + rawData[index + 2].xA + rawData[index + 3].xA) / 4,
                y: (rawData[index].yA + rawData[index + 1].yA + rawData[index + 2].yA + rawData[index + 3].yA) / 4,
                z: (rawData[index].zA + rawData[index + 1].zA + rawData[index + 2].zA + rawData[index + 3].zA) / 4
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === 1) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA + rawData[index + 2].xA + rawData[index + 3].xA) / 5,
                y: (rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA + rawData[index + 2].yA + rawData[index + 3].yA) / 5,
                z: (rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA + rawData[index + 2].zA + rawData[index + 3].zA) / 5
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === 2) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 2].xA + rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA + rawData[index + 2].xA + rawData[index + 3].xA) / 6,
                y: (rawData[index - 2].yA + rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA + rawData[index + 2].yA + rawData[index + 3].yA) / 6,
                z: (rawData[index - 2].zA + rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA + rawData[index + 2].zA + rawData[index + 3].zA) / 6
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === rawData.length - 1) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 3].xA + rawData[index - 2].xA + rawData[index - 1].xA + rawData[index].xA) / 4,
                y: (rawData[index - 3].yA + rawData[index - 2].yA + rawData[index - 1].yA + rawData[index].yA) / 4,
                z: (rawData[index - 3].zA + rawData[index - 2].zA + rawData[index - 1].zA + rawData[index].zA) / 4
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === rawData.length - 2) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 3].xA + rawData[index - 2].xA + rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA) / 5,
                y: (rawData[index - 3].yA + rawData[index - 2].yA + rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA) / 5,
                z: (rawData[index - 3].zA + rawData[index - 2].zA + rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA) / 5
            };
            filteredData[index] = filteredObj;
            continue;
        }
        if (index === rawData.length - 3) {
            const filteredObj = {
                timeStamp: index,
                x: (rawData[index - 3].xA + rawData[index - 2].xA + rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA + rawData[index + 2].xA) / 6,
                y: (rawData[index - 3].yA + rawData[index - 2].yA + rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA + rawData[index + 2].yA) / 6,
                z: (rawData[index - 3].zA + rawData[index - 2].zA + rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA + rawData[index + 2].zA) / 6
            };
            filteredData[index] = filteredObj;
            continue;
        }
        const filteredObj = {
            timeStamp: index,
            x: (rawData[index - 3].xA + rawData[index - 2].xA + rawData[index - 1].xA + rawData[index].xA + rawData[index + 1].xA + rawData[index + 2].xA + rawData[index + 3].xA) / 7,
            y: (rawData[index - 3].yA + rawData[index - 2].yA + rawData[index - 1].yA + rawData[index].yA + rawData[index + 1].yA + rawData[index + 2].yA + rawData[index + 3].yA) / 7,
            z: (rawData[index - 3].zA + rawData[index - 2].zA + rawData[index - 1].zA + rawData[index].zA + rawData[index + 1].zA + rawData[index + 2].zA + rawData[index + 3].zA) / 7
        };
        filteredData[index] = filteredObj;
    }
    return filteredData;
};