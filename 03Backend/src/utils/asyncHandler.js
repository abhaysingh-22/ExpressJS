const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => next(error));
    }
}

export { asyncHandler };











// try catch method for async functions in Express.js
// This utility function wraps an async function in a try-catch block to handle errors gracefully.
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}
*/