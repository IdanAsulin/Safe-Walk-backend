module.exports = {
    validateRequestBody(err, req, res, next) {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
            return res.status(400).json({ message: `Request body is an invalid JSON` });
        next();
    }
};