const express = require('express');
const app = express()
var router = express.Router({mergeParams:true})
const Project = require('../model/projectSchema')

router.get('/', async(req, res) => {
  const projects = await Project.find({})
  .sort({startDate:1})
  // projects.sort({startDate:1})
  // projects.limit(10)
  // res.render('allprojects', { projects});
  res.render('listofprojects', { projects});
//   console.log('Projects',projects)
});

router.get('/addproject', async(req, res) => {
  res.render('addproject');
});

router.post('/addproject', async(req, res) => {
  const project = new Project(req.body)
  await project.save()
  res.redirect('/project');
//   console.log('Projects',projects)
});

router.get('/:id', async (req, res) => {
  const projectId = req.params.id; 
  try {
    const project = await Project.findById(projectId); 

    if (!project) {
      return res.status(404).send('Project not found'); 
    }

    res.render('project_details', {project});
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error fetching project details'); 
  }
}); 

router.get('/:id/editproject', async(req, res) => {
  const projectId = req.params.id; 
  try {
    const project = await Project.findById(projectId); 

    if (!project) {
      return res.status(404).send('Project not found'); 
    }

    res.render('editproject', {project});
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error fetching project details'); 
  }
});

router.put('/:id/editproject', async(req, res) => {
  const projectId = req.params.id; 
  // const {data} = req.body
  try {
    const project = await Project.findById(projectId);
    // const up_project = new Project(req.body)


    if (!project) {
      return res.status(404).send('Project not found'); 
    }
    const updatedproject = await Project.findByIdAndUpdate(
            projectId,
            { $set: req.body }, // Update the bill data
            { new: true, runValidators: true } // Return the updated document
        );
    res.redirect(`/project/${projectId}`);
    console.log('Project data : ',project)
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error fetching project details'); 
  }
  // await project.save()
  
  
});



module.exports = router

