function successResponse(message, data = null) {
    return {
        success: true,
        message,
        data
    };
}

function errorResponse(message, data = null) {
    return {
        success: false,
        message,
        data
    };
}

module.exports = {
    successResponse,
    errorResponse
};