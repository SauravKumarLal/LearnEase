const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        require: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60 //5 min m it'll expire sadly
    }
});

//a fn.. --> to send mail, schema ke neeche & model k upar
async function sendVerificationEmail(email, otp){ //we have to provide kisko email bhejna hai & kis OTP ke saath
    try{
        const mailResponse = await mailSender(email, "Verification email from LearnEase :P", otp);
        console.log("Email sent successfully: ", mailResponse);
    }
    catch(error){
        console.log("error occurred while sending the mail: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){ //doc save hone se just phle ye code run hona chahiye
    await sendVerificationEmail(this.email, this.otp);
    next();
}) 

mongoose.exports = mongoose.model("OTP", "OTPSchema");