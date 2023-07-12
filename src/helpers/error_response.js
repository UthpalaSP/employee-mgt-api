const errorResponse = (responseMessage) => {
    const response = {
        status: 'error',
        message: responseMessage,
    };
    return response;
};

module.exports = errorResponse;
