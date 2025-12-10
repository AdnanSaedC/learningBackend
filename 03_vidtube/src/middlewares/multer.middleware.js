// what we are trying to do here is we are extracting the files from req and storing it in local storage
import multer from "multer"


//here insted of req,res,next we have req,file,cb
//here req is req url ,file is the data u got and cb is what to do with that data
//here cb(null,path)
//null means no error
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
    }
}) 


//now we are going to save the files in the cloudnary 
export const upload = multer({storage})