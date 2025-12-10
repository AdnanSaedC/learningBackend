//everytime while making a connection you have to think about two things
/**
 * 1 there will be always an error so try catch
 * 2 async await
 * 
 */

import mongoose from "mongoose";
import {DB_name} from "../constants.js"

const connectDB = async ()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_name}`)
        console.log(`Connection Successfull ${connection}`);
    } catch (error) {
       console.log("DB connection failed at index in db file",error)
       process.exit(1);
       //iam terminating because somethingn is fissy
    }
}

export default connectDB