export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        success: false,
        message: err.message || "Une erreur interne est survenue sur le serveur.",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

