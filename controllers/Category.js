const Category = require('../models/category');

//craeteCategory ka handler fnn..

exports.createCategory = async(req, res) => {
    try{
        //fetch data from request ki body
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All data required!"
            })
        } 
        //create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });
        console.log(categoryDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Category created successfully!"
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

//getAllcategories handler function..
exports.showAllcategories = async (req, res) => {
    try{
        const allCategories = await Category.find({}, {name: true, description:true}); //kisi criteria ya attribute k basis pe find nhi krna chahta, jo entry hai db mei le aana bas 1 cheez make sure krna saare entry ke andar name n description hona chahiye
        res.status(200).json({
            success: true,
            message: "All categories return successfully",
            allCategories
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};