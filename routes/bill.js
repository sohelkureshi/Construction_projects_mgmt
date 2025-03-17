const express = require('express');
const app = express()
const router = express.Router({ mergeParams: true });
const Bill = require('../model/billSchema');
const Project = require('../model/projectSchema');
const authorize = require('../middleware/authorize');
const user = require("../model/userSchema");

router.get('/', async (req, res) => {
    const projectId = req.params.id;

    try {
        // Fetch the project with populated bills
        const project = await Project.findById(projectId).populate('bills');

        if (!project) {
            return res.status(404).send('Project not found');
        }

        console.log(`Displaying billing page for project id: ${projectId}`);
        res.render('billing', { project });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});

router.get('/addbill',authorize(["engineer", "contractor", "admin"]), async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('addbill', { project:project, user:req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching project');
    }
});

router.post('/addbill',authorize(["engineer", "contractor", "admin"]), async (req, res) => {
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        
        const bill = new Bill(req.body.bill);
        
        bill.created_by = { 
            name:req.user.name, 
            role:req.user.role 
            };
        project.bills.push(bill);
        await bill.save();
        await project.save();

        console.log(`Bill added: ${bill}`);
        res.redirect(`/project/${projectId}/bill`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding bill');
    }
});

// Route to view a specific bill for a project
router.get('/:billId', async (req, res) => {
    const { id: projectId, billId } = req.params;

    try {
        // Find the current project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }

        // Find the specific bill
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).send('Bill not found');
        }

        // Find the most recent bill before the current one for the same project
        const previousBill = await Bill.findOne({
            _id: { $ne: billId }, // Exclude the current bill
            date: { $lt: bill.date }, // Only consider bills before the current one
            _id: { $in: project.bills } // Only look within the bills of this project
        }).sort({ date: -1 }); // Sort to get the latest one before the current bill

        // Determine the previous amount or default to 0
        const previousAmount = previousBill ? previousBill.total_amount : 0;

        console.log(`Displaying billing page for project: ${project.title}, bill: ${bill.Bill_Name}`);
        console.log('Bill', bill);

        // Render the view with the current bill and previous amount
        res.render('viewbill', {
            project: project,
            bill: bill,
            previousAmount,
            user:req.user
        });
    } catch (error) {
        console.error('Error fetching project or bill:', error);
        res.status(500).send('Error fetching project or bill');
    }
});

router.put('/:billId',authorize(["contractor","senior-manager","manager", "admin"]), async (req, res) => {
    const { id: projectId, billId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }

        const updatedBill = await Bill.findByIdAndUpdate(
            billId,
            { $set: req.body.bill }, // Update the bill data
            { new: true, runValidators: true } // Return the updated document
        );
        updatedBill.created_by = { 
            name:req.user.name, 
            role:req.user.role 
            };

        if (!updatedBill) {
            return res.status(404).send('Bill not found');
        }

        console.log(`Bill updated: ${updatedBill.Bill_Name}`);
        res.redirect(`/project/${projectId}/bill/${billId}`); // Redirect to the updated bill's page
    } catch (error) {
        console.error('Error updating the bill:', error);
        res.status(500).send('Error updating the bill');
    }
});

// Other routes like GET, POST...
router.get('/:billId/edit',authorize(["contractor","senior-manager","manager", "admin"]), async (req, res) => {
    const { id: projectId, billId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Project not found');
        }

        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).send('Bill not found');
        }

        res.render('editbill', { project:project, bill:bill, user:req.user });
    } catch (error) {
        console.error('Error fetching project or bill:', error);
        res.status(500).send('Error fetching project or bill');
    }
});

module.exports = router;

