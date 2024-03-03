const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

//auth
exports.auth = async (req, res, next) => {
    try{
        //extract token --> 3 ways
        const token = req.cookies.token
                            || req.body.token
                            || req.header("Authorization").replace("Bearer ", "");
        //if token missing, then return response
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing!"
            });
        }
        //verify the token 
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(err){
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token!"
        });
    }
}
//isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for user students only!"
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified"
        });
    }
}

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for user instructor only!"
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}
//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is protected route for user Admin only, please try again!"
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }
}
