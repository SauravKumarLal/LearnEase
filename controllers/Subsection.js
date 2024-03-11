const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

//create SubSection

exports.createSubSection = async(req, res) => {
    try{
        //fetch data from request body
        const{sectionId, title, timeDuration, description} = req.body;
        
        //extract file/data
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        //upload video to clodinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create a subsection
        const subsectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url
        })
        //update subsection with the subsection ObjectId
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                    {$push: {
                                                        subSection: subsectionDetails._id,
                                                    }},
                                                    {new: true});
        //HW: log updated section here, after adding populate query
        //return response
        return res.status(200).json({
            success: true,
            message: 'Sub Section created successfully',
            updatedSection
        })

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

//HW: updateSubSection

//HW: deleteSubSection