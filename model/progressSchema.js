const mongoose = require('mongoose');
const {Schema} = mongoose

const progressSchema = new Schema({
  task : {type:String,required : true},
  initial_date : {type:Date,required : true},
  final_date : {type:Date,required : true},
  percentage : {type:Number,required : true,min : 0,max : 100},
  completed : {type:Boolean,required : true,default : false},
  image : [
    {
    fileName : String,
    url : String
    }
  ],
  description : {type:String,required : true}
}
,
{
  collection:'progress'
}
)

module.exports = mongoose.model('Progress',progressSchema)