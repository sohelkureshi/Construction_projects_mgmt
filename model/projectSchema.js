const mongoose = require('mongoose')
const bill = require('./billSchema')
const progress = require('./progressSchema');

const { Schema } = mongoose

const projectSchema = new Schema({
    title: {type:String,required : true},
    supervisor : {type:String,required : true},
    company : {type:String,required : true},
    overview: {type:String,required : true},
    location: {type:String,required : true},
    duration: {type:String,required : true},
    status: {type:String,required : true},
    startDate: Date,
    expectedDate: Date,
    // progress: {type : Number, min : 0,max : 100},

    bills : [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bill'
      }
    ],
    progresses : [
      {
        type: Schema.Types.ObjectId,
        ref: 'Progress'
      }
    ]
},

{
  collection: 'project'
}
)

module.exports = mongoose.model('Project',projectSchema)