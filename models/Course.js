const mongoose = require("mongoose"); 

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String
    },
    courseDescription: {
        type: String
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId, //1 hi instructor hai toh
        ref: "User",
        required: true
    }, 
    whatYouWillLearn: {
        type: String
    },
    courseContent: [ //courseContent ke andar multiple sections aate hai --> mul ka mtlb 1 list create karni padegi, section ka mtlb refer krna padega
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [ //bohot saare rating/reviews ho sakte hain 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],
    price: {
        type: Number
    },
    thumbnail: {
        type: String
    },
    tag: {
        type: [String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true, 
            ref: "user"
        }
    ],
    instructions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    }
});


module.exports = mongoose.model("Course", courseSchema);