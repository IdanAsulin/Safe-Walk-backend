module.exports = {
    checkEmail: email => {
        const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return emailRegEx.test(email);
    }
};