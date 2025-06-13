const APIresponse = (status, message, data) => {
    return {
        status: status,
        message: message,
        data: data || null // Optional: If no data is provided, set it to null
    };
}

export { APIresponse };