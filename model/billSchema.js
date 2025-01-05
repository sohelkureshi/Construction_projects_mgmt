const mongoose = require('mongoose')
const {Schema} = mongoose

const billSchema = new Schema({
    "bill_id": {type:Number},
    "date": {type:Date},
    "Bill_Name" : {type:String},

    "items": [
        {
            "item_id": {type:Number,required:true},
            "name": {type:String,required:true},
            "quantity": {type:Number,required:true},
            "units" : {type:String,required:true},
            "rate": {type:Number,required:true},
            "amount": {type:Number,required:true}
        }
    ],
    "previous_amount" : Number,
    "total_amount": {type:Number,required:true}
},
{
    collection:"bill"
}
);

module.exports = mongoose.model('Bill',billSchema)