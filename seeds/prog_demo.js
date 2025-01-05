const mongoose = require('mongoose');
require('dotenv').config(); 
const Bill = require('../model/billSchema'); // Reference to the Bill model
const Project = require('../model/projectSchema'); // Reference to the Project model
const Progress = require('../model/progressSchema')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("Database connected");

    try {
        
        const project = await Project.findOne({ title: 'Library Extension' }).populate('progresses');
        const progress = await Progress.findOne({ task: 'Planning' });
        // console.log(progress)
        const in_date = progress.initial_date
        const fi_date = progress.final_date
        var curr_date = new Date()
        console.log(`Start Date: ${in_date},End Date : ${fi_date}, Curr Date : ${curr_date}`)


        /*
        const s_date = project.startDate
        const e_date = project.expectedDate
        var curr_date = new Date()
        const total = e_date-s_date
        const total_days = Math.ceil(( total) / (1000 * 60 * 60 * 24));
        const e_curr = e_date-curr_date
        const time_spent = curr_date-s_date
        const timespent_days = Math.ceil(( time_spent) / (1000 * 60 * 60 * 24));
        const timeDifference_days = Math.ceil(( e_curr) / (1000 * 60 * 60 * 24));
        const percent = ((timespent_days/total_days)*100).toFixed(2)
        if(curr_date>e_date){
            percent = 100
        }


        console.log(`Start Date: ${s_date}, 
        End Date : ${e_date},
        Curr Date : ${curr_date}`)
        console.log(`Total Days : ${total_days}, Time Left: ${timeDifference_days} days`)
        console.log(`Progress Percentage: ${percent} % done`)        
        */

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        mongoose.connection.close();
    }
})
.catch(error => {
    console.error("Connection error:", error);
});
