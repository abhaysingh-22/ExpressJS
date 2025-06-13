class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Optional: You can add additional data if needed
    }
}

export { APIError };