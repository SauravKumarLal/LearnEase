const { error } = require("console"); //khud aagya .catch m error dalne se
const mongoose = require("mongoose");
require("dotenv").config(); //env configuaration se cheezon ko leke aao

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, { //mongoose ka connect method
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected Successfully!")) //successfull implementation k lie .then
    .catch( (error) => {
        console.log("DB Connection Failed!");
        console.error(error);
        process.exit(1);
    })
}

