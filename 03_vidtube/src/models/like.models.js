import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema({
    //only one field will be filled others will be null
    video:{
        type:Schema.Types.ObjectId,
        ref : "Video"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref : "Comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref : "Tweet"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref : "User",
        required:true
    },
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)