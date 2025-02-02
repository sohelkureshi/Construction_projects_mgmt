const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env
const Bill = require('../model/billSchema');
const Project = require('../model/projectSchema');
const bill_data = require('./bill_list');
const proj_data = require('./proj_list');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database connected");
    } catch (error) {
        console.error("Connection error:", error);
        process.exit(1); // Exit the process if connection fails
    }
}

async function clearExistingData() {
    try {
        await Bill.deleteMany({});
        console.log('Existing bill data cleared.');
    } catch (error) {
        console.error('Error clearing existing data:', error);
    }
}

async function insertBillData() {
    try {
        const insertedBills = await Bill.insertMany(bill_data);
        console.log(`${insertedBills.length} bill documents were inserted.`);
        return insertedBills;
    } catch (error) {
        console.error('Error inserting bill data:', error);
    }
}

async function updateProject() {
    try {
        const projectToUpdate = await Project.findOne({ title: 'PG Classroom Complex' });
        if (projectToUpdate) {
            const updatedProject = await Project.findOneAndUpdate(
                { title: 'PG Classroom Complex' },
                { $push: { bills: { $each: bill_data.map(bill => bill.id) } } },
                { new: true }
            );
            console.log('Bills added to the project successfully.', updatedProject);
        } else {
            console.log('Project not found');
        }
    } catch (error) {
        console.error('Error updating project:', error);
    }
}

async function main() {
    await connectToDatabase();
    await clearExistingData();
    await insertBillData();
    await updateProject();
    mongoose.connection.close();
    console.log("Database connection closed");
}

main();
