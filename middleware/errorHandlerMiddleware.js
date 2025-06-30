const errorMiddleware = (err, req, res, next) => {
    // Extract status, message, and details from the error
    const status = err.status || 500;
    const message = err.message || 'Backend Error';
    const details = err.details || null; // Default to null if not provided

    // Log the error (customize this for production)
    console.error(`[Error] ${message}`, {
        status,
        details,
        stack: err.stack,
    });

    // Send structured JSON response
    return res.status(status).json({
        message,
        ...(details && { details }) // Include details only if they exist
    });
};

module.exports = errorMiddleware;
