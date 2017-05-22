const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotoSchema = mongoose.Schema({
    link: {
        type: Schema.Types.String
    }
});




const Photo = mongoose.model("Photo", PhotoSchema);

module.exports = Photo;
