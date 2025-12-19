import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        //the one who is for which iam a subscriber
        // another way is who is subscribing
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        //to which channel
        //here channel is nothing but user
        //this are the user who has subscribed to my channel
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);