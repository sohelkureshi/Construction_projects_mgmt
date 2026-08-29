const mongoose = require('mongoose')
const bill = require('./billSchema')
const progress = require('./progressSchema');
const comment = require('../model/commentSchema')
const { Schema } = mongoose

const projectSchema = new Schema({
  title: { type: String, required: true },
  supervisor: { type: String, required: true },
  company: { type: String, required: true },
  overview: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  status: { type: String, required: true },
  startDate: Date,
  expectedDate: Date,
  // progress: {type : Number, min : 0,max : 100},

  bills: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Bill'
    }
  ],
  progresses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Progress'
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],

  // Add these new fields for document storage
  drawings: [
    {
      title: String,
      link: String, // Google Drive link
      date: { type: Date, default: Date.now },
      user_id: Schema.Types.ObjectId,
      user_name: String,
      image: String // thumbnail path
    }
  ],

  tenders: [
    {
      title: String,
      link: String, // Google Drive link
      date: { type: Date, default: Date.now },
      user_id: Schema.Types.ObjectId,
      user_name: String,
      image: String // thumbnail path
    }
  ]
},

  {
    collection: 'project'
  }
)

module.exports = mongoose.model('Project', projectSchema)