// const { response } = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');

exports.UserProfile = async(req, res) => {
    try{
        //get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;//input mei aarhi hogi toh le lenge, 
                                                                           //nhi toh by default empty maan lenge
        //get userId
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: 'ALl fields are required!'
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        
        //return response
        return res.status(200).json({
            success: true,
            message: 'Profile Upgrared Successfully',
            profileDetails
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//delete function
exports.deleteAccount = async(req, res) => {
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails}); 

        //TODO:(HW): unEnroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success: true,
            message: 'User deleted Successfully',
            profileDetails
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User cannot be deleted successfully'
        });
    }
}

exports.getAllUserDetails = async(req, res) => {
    try{
        //get id
        const id = req.user.id;

        //validation & get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success: true,
            message: 'User Data fetched Successfully',
            profileDetails
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}