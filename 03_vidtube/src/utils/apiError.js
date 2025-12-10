class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
    ) {
//here super calls parent constructor here
        super(message);
        //this will call the parent contructor and set the message
        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors;
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
            //parameter 1 is all about we are taking about this object
            //parameter 2 is where to start from
        }
    }
}

export { ApiError };