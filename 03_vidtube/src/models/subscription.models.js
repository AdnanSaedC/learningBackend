import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        //the one who is for which iam a subscriber
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        //here channel is nothing but user
        //this are the user you have subscribed to my channel
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);