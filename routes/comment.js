const express = require('express');
const app = express()
const router = express.Router({ mergeParams: true });
const Comment = require('../model/commentSchema');
const Project = require('../model/projectSchema');
const authorize = require('../middleware/authorize');

router.get('/', async (req, res) => {
    const projectId = req.params.id;

    try {
        // Fetch the project with populated bills
        const project = await Project.findById(projectId).populate('comments');

        if (!project) {
            return res.status(404).send('Project not found');
        }

        console.log(`Displaying comments page for project id: ${projectId}`);
        res.render('view_comments', { project });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});


router.get('/addcomment',authorize(["engineer", "contractor","senior-manager","manager" ,"admin"]), async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('addcomment', { project:project, user:req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});


router.post('/addcomment',authorize(["engineer", "contractor", "senior-manager","manager","admin"]), async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        
        const comment = new Comment(req.body);
        
        comment.user_name = req.user.name
        comment.user_role = req.user.role
        project.comments.push(comment);
        await comment.save();
        await project.save();

        console.log(`Comment added: ${comment}`);
        res.redirect(`/project/${projectId}/comment`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding comment!');
    }
});

// Route to view a specific bill for a project


module.exports = router;

