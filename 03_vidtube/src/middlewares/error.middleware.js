//why it exist
// we want to handle all the error all the errors
// apierror is a format to send the error data here we are just handling it better for some rare case first creating an objcet of error and sending it back


import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err,req,res,next)=>{
    //first lets capture the error
    let error = err

    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || error instanceof mongoose.Error?400:500
        console.log(error.message)
        const message = error.message || "Something went error"

        console.log("new Error created")
        error = new ApiError(statusCode,message,error?.errors || [],err.stack)
    }

    const response = {
        //it is nothing but copy all the key and values from error and add here we call it destructuring
        ...error,
        message:error.message,
        ...(process.env.NODE_ENV == "developement" ? {stack:error.stack}:{})
    }

    return res.status(error.statusCode).json(response)
}

export default errorHandler