const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

//resetPasswordToken --> mail send karne ka kaam ye bhai saab kr rhe
exports.resetPasswordToken = async(req, res) => {
    try{
        //get email from req body
        const email = req.body.email;
        //check user for this mail, email validation
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success: false,
                message: "Your email is not registered with us"
            });
        }
        //generate token
        const token = crypto.randomUUID(); //now it come inbuild with node.js mods
        //update user by adding token and expiration time 
        const upadtedDetails = await User.findOneAndUpdate(
            {email: email}, //db se iss email k basis pe entry leke aao
            {
                token: token,
                resetPasswordExpires: Date.now()+5*60*1000 //usme ye 2 cheez change krdo
            },
            {new: true}); //iss 3rd parameter se updated doc pass hota hai response mei

        //create url
        const url = `http://localhost:3000/update-password${token}` //diff link for diff user based on token
        //send mail containing the url
        await mailSender (email, 
            "Password Reset Link",
            `Password Reset Link: ${url}` );
        
        //return response
        return res.json({
            success: false,
            message: 'Email sent successfully, please check email and change password'
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending reset password mail'
        })
    }
    
}

//resetPassword --> DB m upadte karne ka kaam ye bhai saab kr rhe
//3 cheez aane wala hai --> 1.token, 2.pwd, 3.confirmPwd
exports.resetPassword = async(req, res) => {
    try{
        //data fetch
        const {password, confirmPassword, token} = data.body
        
        //validation
        if(password != confirmPassword){
            return res.json({
                success: false,
                message: 'Password not matching'
            });
        }
        // get user details from db using token 
        const userDetails = await User.findOne({token: token});
        
        //if kisi token k lie entry nhi mili - invalid token
        if(!userDetails){
            return res.json({
                success: false,
                message: 'Invalid Token!'
            });
        }
        //2nd case for invalid token - token ka time expire hogya, so check time
        if(userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success: false,
                message: 'Token is expired, please regenerate your token!'
            });
        }
        //hash new pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update 
        await User.findOneAndUpdate(
            {token: token}, //iske basis pr dhubd k laaege User ko
            {password: hashedPassword}, //ye value update krna hai
            {new: true}
        );

        //return response
        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while sending reset password mail'
        })
    }
}