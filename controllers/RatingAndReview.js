const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');

//createRating
exports.createRating = async (req, res) => {
    try{
        //get userId
        const userId = user.req.id;
        //fetch data from user ki Id
        const {rating, review, courseId} = req.body;
        //check if user is enrolled is not
        const courseDetails = await Course.findOne(
                                        {_id: courseId,
                                        studentsEnrolled: {$elemMatch: {$eq: userId}}  //study about elemMatch, eq operator  
                                        });
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: 'Student is not enrolled in the course'
            });
        }
        //check krlo user ne already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                    user: userId,
                                                    course: courseId
        });
        
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user'
            });
        }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
                                        rating, review,
                                        course: courseId,
                                        user: userId
        });

        //update course with this rating
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseId}, 
                                    {
                                        $push: {
                                            ratingAndReviews: ratingReview._id,
                                        }
                                    },
                                    {new: true}
                                        
        );
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success: true,
            message: 'Raying And Review done successfully',
            ratingReview
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


//getAverageRating


//getAllRating