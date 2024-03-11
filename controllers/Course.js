//models import
const Course = require("../models/Course");
const Tag = require("../models/category");
const User = require("../models/User")
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try{
        //fetch data from body
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body; //ye sab req ki body mei aarha

        //get thumbnail
        const thumbnail = get.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !category){
            return res.status(400).json({
                success: false,
                message: 'All fields are required!'
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log('Instructor Deatils: ', instructorDetails);
        
        //TODO: verify that userId & instructorDetails._id are same or different?
        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor details not found!'
            })
        }

        //check given category is valid or not
        const categoryDetails = await category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category details not found!'
            }) 
        } 

        //Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id, //bcuz instructor is an id in schema
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id, 
            thumbnail: thumbnailImage.secure_url
        })

        //add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new: true},
        );

        //update the CATEGORY ka schema
        
        //return response
        return res.status(200).json({
            success: true,
            message: 'Course creted successfully',
            data:newCourse
        });
    } 
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create course!',
            error: error.message
        })
    }
};


//getAllCourses handler function
exports.showAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find({}, {courseName: true, 
                                                    price: true,
                                                    thumbnail: true,
                                                    instructor: true,
                                                    ratingAndReviews: true,
                                                    studentsEnrolled: true})
                                                    .populate("instructor")
                                                    .exec();
        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
            data: allCourses
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Cannot fetch course data',
            error: error.message
        })
    }
}