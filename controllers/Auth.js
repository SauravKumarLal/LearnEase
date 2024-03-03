const User = require("../models/User"); //models ko import so that we can interact wuth DB using model 
const OTP = require("../models/OTP");

const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//sendOTP
exports.sendOTP = async(req, res) => {
    try{
        //fetch email request ki body m se
        const {email} = req.body; 

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //return response, if user already exists
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: 'User Already Registered!'
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {   //otp-generator pe method call kr dia jisko kehte hai generate
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars:false,
            // digits: 
        });
        console.log("OTP Generated: ", otp);

        //now, make sure otp generated is unique
        let result = await OTP.findOne({otp: otp});
        
        //if not unique, generate new 
        while(result){
            otp = otpGenerator(6, {   //otp-generator pe method call kr dia jisko kehte hai generate
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars:false
            });
            result = await OTP.findOne({otp: otp});
        }
        
        //make this OTP entry in DB
        const otpPayload ={email, otp};

        //create an entry for OTP in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return successful response
        res.status(200).json({
            success:true,
            message: 'OTP sent successfully',
            otp,
        })  //200 -> successfull

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

//signUp
exports.signUp = async(req, res) => {
    try{
        //data fetch from req ki body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate it
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required!'
            })
        }
        
        //match pswrd & cnfrm pswrd
        if(password != confirmPassword){
            return res.status(400).json({
                success:false,
                message:'password and confirmPassword doesn\'t match, please try again'
            })

        }
        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User is already registered/exists'
            });
        }

        //find most recent otp for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        //validate otp
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message: 'OTP not found!'
            })
        } else if(otp !== recentOtp.otp){
            //Invalid OTP
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            })
        }
        
        //hash pswrd
        const hashedPassword = await bcrypt.hash(password, 10); //salt=10

        //create entry in DB

        const profileDeatails = profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const user = await User.create ({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additonalDetails: profileDeatails._id, //isme hum profile ka data dalte the
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        //return response
        return res.status(200).json({
            success: true,
            message: 'User is registered successfully!',
            user
        })


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: 'User cannot be registered. Plaese, try again!'
        })
    }  
}

//Login
exports.login = async(req, res) => {
    try{
        //get data from req body
        const {email, password} = req.body;

        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again'
            });
        }

        //check if user exists
        const user = await User.findOne({email}).populate("additonalDetails");
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User is not registered, please signup first!'
            })
        }
        
        //if everything is fine, generate JWT(token),, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, { // JWT --> JSON Web Token
                expiresIn: '2h'
            });
            user.token = token;
            user.password = undefined;

            //create cookie & send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*100), //3 days
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token, 
                user,
                message: 'Successfully Logged in!'
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: 'Incorrect Password!'
            })
        }
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Unsuccessful, please try again!'
        });
    }
};

//changePassword
exports.changePassword = async(req, res) => {
    //get data from body
    //get oldPassword, newPassword, confirmPassword
    //validation

    //update pwd in DB
    //send mail - Password update
}




//HTTP Requests ---->
// 200 OK: The request was successful.
// 201 Created: The request was successful, and a new resource was created as a result.
// 204 No Content: The server successfully processed the request, but there is no content to send in the response.
// 400 Bad Request: The server could not understand the request due to malformed syntax, invalid request message framing, or deceptive request routing.
// 401 Unauthorized: Similar to 403 Forbidden, but specifically for authentication issues. The client must authenticate itself to get permission.
// 403 Forbidden: The client does not have the necessary permission to access the resource.
// 404 Not Found: The requested resource could not be found on the server.
// 500 Internal Server Error: A generic error message indicating that an unexpected condition was encountered on the server.
