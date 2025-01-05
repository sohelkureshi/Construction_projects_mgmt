const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env
const Bill = require('../model/billSchema'); // Reference to the Bill model
const Project = require('../model/projectSchema'); // Reference to the Project model
const bill_data = require('./bill_list'); // Import bill data
const proj_data = require('./proj_list'); // Import project data

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log("Database connected");

        try {
            // Fetch the "PG Classroom Complex" project and populate its bills
            const projectToUpdate = await Project.findOne({ title: 'PG Classroom Complex' }).populate('bills');

            if (projectToUpdate && projectToUpdate.bills.length > 0) {
                console.log(`Displaying bills for ${projectToUpdate.title}:`);
                for (let bill of projectToUpdate.bills) {
                    console.log(`Bill ID: ${bill.bill_id}`);
                    console.log(`Bill Name: ${bill.Bill_Name}`);
                    console.log('------------------------');
                    for (let item of bill.items) {
                        console.log(`Item Name: ${item.name}`);
                        console.log(`Quantity: ${item.quantity}`);
                        console.log(`Units: ${item.units}`);
                        console.log(`Rate: ${item.rate}`);
                        console.log(`Amount: ${item.amount}`);
                        console.log('------------------------');
                    }
                }
            } else {
                console.log('No bills found for PG Classroom Complex.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            mongoose.connection.close();
            console.log("Database connection closed");
        }
    })
    .catch(error => {
        console.error("Connection error:", error);
    });
