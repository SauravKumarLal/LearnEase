const mongoose = require("mongoose"); //mongoose ka instance --> mongoose ko import kara lia

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true //"trim" removes all whitespaces
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum:["Admin", "Student", "Instructor"], //only 3 values for accountType so, we can use enum
        required: true
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    image: {
        type: String, //image URL
        required: true,
    },
    token: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "courseProgress",
        }
    ],
});


module.exports = mongoose.model("User", userSchema);