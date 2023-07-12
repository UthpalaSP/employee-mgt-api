const successResponse = ( data) => {
    const response = {
        status: 'success',
        data: {
            data,
        },
    };
    return response;
};

module.exports = successResponse;
