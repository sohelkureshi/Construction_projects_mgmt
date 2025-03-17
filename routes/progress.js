const express = require('express');
const app = express()
const router = express.Router({ mergeParams: true });
const Progress = require('../model/progressSchema');
const Project = require('../model/projectSchema');
const {storage} = require('../cloudinary/index')
const multer = require('multer')
const upload = multer({ storage})
const authorize = require('../middleware/authorize');

router.get('/', async (req, res) => {
    const projectId = req.params.id;

    try {
        // Fetch the project with populated progress
        const project = await Project.findById(projectId).populate('progresses');
        // const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).send('Project not found');
        }
        const s_date = project.startDate
        const e_date = project.expectedDate
        var curr_date = new Date()

        const total = e_date-s_date
        const total_days = Math.ceil(( total) / (1000 * 60 * 60 * 24));
        // const e_curr = e_date-curr_date
        const time_spent = curr_date-s_date
        const timespent_days = Math.ceil(( time_spent) / (1000 * 60 * 60 * 24));

        let percent = ((timespent_days/total_days)*100).toFixed(2)
        if(curr_date>e_date){
            percent = 100
        }
        if(time_spent<0){
            percent = 0
        }

        console.log(`Displaying progress page for project id: ${projectId}`);
        res.render('listview_progress', {project,percent,user:req.user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});


router.get('/:progressId/viewprogress', async (req, res) => {
    const { progressId } = req.params;

    try {
        // Fetch the progress by ID
        const progress = await Progress.findById(progressId);
        if (!progress) {
            return res.status(404).send('Progress not found');
        }

        // Optionally, fetch the associated project if needed for context
        const project = await Project.findOne({ progresses: progressId });
        if (!project) {
            console.warn(`Project containing progress ID ${progressId} not found`);
        }

        res.render('viewprog_task', { project, progress });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).send('Error fetching progress');
    }
});

router.get('/:progressId/editprogress',authorize(["engineer", "contractor", "admin"]), async (req, res) => {
     const { id: projectId, progressId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        const updatedProgress = await Progress.findById(progressId)
        if (!updatedProgress) {
            return res.status(404).send('Progress not found');
        }

        // console.log(`Progress updated for: ${updatedProgress.task}`);
        res.render('editprog_task', { project, progress: updatedProgress, user:req.user });
    } catch (error) {
        console.error('Error updating the bill:', error);
        res.status(500).send('Error updating the bill');
    }
})

router.put('/:progressId/editprogress',authorize(["engineer", "contractor", "admin"]), upload.array('image',3), async (req, res) => {
    const { id: projectId, progressId } = req.params;
    try {
        const { task, initial_date, final_date, percentage, completed, description, removedImages } = req.body;

        // Find the existing progress document
        const progress = await Progress.findById(progressId);
        if (!progress) {
            return res.status(404).send('Progress not found');
        }

        // Remove images based on removedImages array
        if (removedImages && Array.isArray(removedImages)) {
            progress.image = progress.image.filter((img, index) => !removedImages.includes(index.toString()));
        }

        // Handle new image uploads if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => ({
                fileName: f.filename,
                url: f.path
            }));
            progress.image = progress.image.concat(newImages);
        }

        // Update other fields
        progress.task = task;
        progress.initial_date = initial_date ? new Date(initial_date) : progress.initial_date;
        progress.final_date = final_date ? new Date(final_date) : progress.final_date;
        progress.percentage = percentage;
        progress.completed = completed === 'on';
        progress.description = description;

        await progress.save();

        res.redirect(`/project/${projectId}/progress/${progressId}/viewprogress`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.get('/addprogress',authorize(["engineer", "contractor", "admin"]), async (req, res) => {
    const projectId = req.params.id;

    try {
        // Fetch the project with populated progress
        const project = await Project.findById(projectId);
        // const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('addprogress', {project,user:req.user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});

router.post('/addprogress',authorize(["engineer", "contractor", "admin"]), upload.array('image', 3), async (req, res) => {
    const projectId = req.params.id;
    console.log(projectId)

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }

// /*
        // Extract only the expected fields from req.body
        const { task, initial_date, final_date, percentage, completed, description } = req.body;
        const progress = new Progress({
            task,
            initial_date,
            final_date,
            percentage,
            completed,
            description
        });

        const img = req.files;
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        progress.image = img.map(f => ({ fileName: f.filename, url: f.path }));
        await progress.save();

        project.progresses.push(progress._id);
        await project.save();

        res.redirect(`/project/${projectId}/progress`);
        console.log(`Progress made: ${project.progresses}`);
        // */
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).send('Error adding progress');
    }
});

module.exports = router;

