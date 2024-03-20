const { instance } = require("../config/razorpay"); //destructuring kr k instance ko find kar skte hai
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { response } = require("express");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the Razorpay order
exports.capturePayment = async(req, res) => {
    //get courseId amd userID
    const {course_id} = req.body;
    const userId = req.user.id;
    
    //validation
    //valid courseID
    if(!course_id){
        return res.json({
            success: true,
            message: 'Please provide valid user Id'
        })
    };
    //valid courseDetails
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success: false,
                message: 'Could not find the course'
            });
        }
        //user already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);//string se userid mei convert kr lia
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message: 'Student is already enrolled!'
            });
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message:error.message
        });
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now().toString()), //Date to make it unique
        notes: {
            courseId: course_id,
            userId
        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    }
    catch(error){
        console.log(error);
        res.json({
            success: false,
            message: 'Couldnot initiate the order'
        })
    }
};


//create hogya, now authorization k lie 2nd handler fn..
//verify Signature of razorpay and Server

exports.verifySignature = async(req, res) => {
    //match server ka secret with razorpay ne bheja hai wo secret
    const webhookSecret = "1234578";

    //dusra signature razorpay se aayega input mei
    const signature = req.headers["x-razorpay-signature"];

    crypto.createHmac("sha256", webhookSecret);

    //hashing algo k baad jo output aata hai uske hum 'DIGEST' k term se refer krte hain, which 
    //are generally in hexadecimal format
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    //match digest n signature
    if(signature == digest){
        console.log('Payment is authorized');

        const{courseId ,userId} = req.body.payload.payment.entity.notes;

        try{
            //fullfil the action

            //find the course and enroll the student in it
            const enrollCourse = await Course.findOneAndUpdate(
                                                        {_id: userId},
                                                        {$push: {studentsEnrolled: userId}},
                                                        {new: true}
            );

            if(!enrollCourse){
                return res.status(500).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            console.log(enrollCourse);

            //find the student and add the course to their last enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                                                        {_id: userId},
                                                        {$push:{courses: courseId}},
                                                        {new:true}
            );

            console.log(enrolledStudent);

            //now send confirmation mail 
            const emailResponse = await mailSender(
                                            enrolledStudent.email,
                                            "Congratuation from Studynotion",
                                            "Congratulation, you are inboareded in te new course"
            );

            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: 'Signature Verified and Course Added'
            });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    else{
        return res.status(400).json({
            success: false,
            message: 'Invalid Request'
        });
    }
}
