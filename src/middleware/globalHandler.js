export const globalErrorHandler = (err, req, res, next) => {

    if (err) {
        console.error(err.stack);
        res.status(500).json({ message: "Internal server error", error: err.message , stack: err.stack });
    }

    next();
};
