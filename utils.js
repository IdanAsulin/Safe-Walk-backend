module.exports = {
    checkIP(ip) {
        const ipRegEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegEx.test(ip);
    },
    checkForDuplicates(array, attribute) {
        const valueArr = array.map(item => item[attribute]);
        const isDuplicate = valueArr.some((item, index) => valueArr.indexOf(item) !== index);
        return isDuplicate;
    }
};