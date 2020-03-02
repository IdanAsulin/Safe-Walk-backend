const redis = require('./redisConnection');

module.exports = {
    checkIP(ip) {
        const ipRegEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegEx.test(ip);
    },
    
    checkForDuplicates(array, attribute) {
        const valueArr = array.map(item => item[attribute]);
        const isDuplicate = valueArr.some((item, index) => valueArr.indexOf(item) !== index);
        return isDuplicate;
    },

    getFromRedis(id) {
        return new Promise((resolve, reject) => {
            redis.get(id, (error, data) => {
                if (error) {
                    return reject(`Error while trying to search for id ${id} in REDIS cache memory: ${error.message}`);
                }
                if (data) {
                    data = JSON.parse(data);
                    return resolve({
                        found: true,
                        data: data
                    });
                }
                else {
                    return resolve({
                        found: false,
                        data: null
                    });
                }
            });
        });
    }
};