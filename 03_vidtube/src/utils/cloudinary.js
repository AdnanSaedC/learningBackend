import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"
import { asyncHandler } from './asyncHandler.js';

dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnClaudinary=async (filePath)=>{
    try {
        if(!filePath) return null;

        //so we are going to upload this url and type you guess it on your own
        const response = await cloudinary.uploader.upload(
            filePath,
            {
                resource_type:"auto"
            }
        )
        // console.log("uploaded Succesfully ");
        // console.log(response)
        //lets remove the file from our storage
        fs.unlinkSync(filePath);

        return response

    } catch (error) {
        console.log("Error message: "+error)
        //if there is an error removing the fill and returning null
        fs.unlinkSync(filePath);
        return null
    }
}

const deleteFromCloudinary = asyncHandler(async(publicID)=>{
    try {
        const result= await cloudinary.uploader.destroy(publicID)
        console.log("deleted successfylly",publicID)
    } catch (error) {
        console.log("failed to delete from cloudinary"+error)
        return null
    }})


export { uploadOnClaudinary , deleteFromCloudinary }