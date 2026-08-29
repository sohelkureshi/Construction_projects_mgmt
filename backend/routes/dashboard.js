// routes/dashboard.js
const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });
const authorize = require("../middleware/authorize");
const Project = require("../model/projectSchema");
const User = require("../model/userSchema");

router.get('/',authorize(["guest","engineer", "contractor", "manager", "senior-manager", "admin"]),async(req,res)=>{
    const projects = await Project.find({})
    var ongoing = 0
    var completed = 0
    for(let i = 0;i<projects.length;i++){
        const s_date = projects[i].startDate
        const e_date = projects[i].expectedDate
        var curr_date = new Date()
        if (curr_date<e_date && curr_date>s_date) {
            ongoing+=1
        }
        if (curr_date>e_date) {
            completed+=1
        }
        // console.log(`Start date : ${s_date}, End date : ${e_date}`)
    }

    res.render('dashboard',{ongoing:ongoing,completed:completed,user:req.user})
})

module.exports = router;
