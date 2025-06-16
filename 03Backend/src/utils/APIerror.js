class APIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export { APIError };