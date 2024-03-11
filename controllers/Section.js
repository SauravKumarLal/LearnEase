const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req, res) => {
    try{
        //data fetch
        const{sectionName, courseId} = req.body;
        //data vaidation
        if(!sectionName || !courseId ){
            return res.status(400).json({
                success: false,
                message: 'Missing Properties'
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent: newSection._id,
                                                }
                                            },
                                            {new: true}
                                        );
        //HW: use populate to replace section/subsection both in updatedCourseDetails
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section created successfully',
            updatedCourseDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Unable to create section, please try again',
            error: error.message
        });
    }
}

exports.updateSection = async(req, res) => {
    try{
        //data input
        const {sectionName, sectionId} = req.body;
        //data validate
        if(!sectionName || !sectionId ){
            return res.status(400).json({
                success: false,
                message: 'Missing Properties'
            });
        }

        //update data
        const section = await Section.findOneAndUpdate(sectionId, {sectionName}, {new: true});

        //return response
        return res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            updatedCourseDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Unable to create section, please try again',
            error: error.message
        });
    }
}

exports.deleteSection = async(req, res) => {
    try{
        //name pata hone ki jarurat nhi hai, id pata hoga hum delete kr denge
        //get Id - assuming that we are sending Id in params
        const {sectionId} = req.params
        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId); //sectionId ke basis pe delete
        //TODO[testing]: do we need to delete the entry from the course schema
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            updatedCourseDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Unable to delete Section, please try again',
            error: error.message
        });
    }
}