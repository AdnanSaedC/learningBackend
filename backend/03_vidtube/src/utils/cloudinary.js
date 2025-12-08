import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnClaudinary=async (filePath)=>{
    try {
        if(!filePath) return null;

        //so we are going to upload this url and type you guess it on your own
        const response = cloudinary.uploader.upload(
            filePath,
            {
                resource_type:"auto"
            }
        )
        console.log("uploaded Succesfully"+response);
        //lets remove the file from our storage
        fs.unlinkSync(filePath);

    } catch (error) {
        //if there is an error removing the fill and returning null
        fs.unlinkSync(filePath);
        return null
    }
}

export { uploadOnClaudinary }