const mongoose = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new Schema(
    {
    comment : {type : String, required : true},
    date : {type : Date, default : Date.now},
    user_name : {type : String, required : true},
    user_role : {type : String, required : true},
    },
    {
        collection : 'comment'
    }
)

module.exports = mongoose.model('Comment',commentSchema)
