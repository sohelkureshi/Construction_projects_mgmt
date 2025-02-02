const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
const project = require('../model/projectSchema'); // Import project schema/model
const data = require('./proj_list'); // Import data to be inserted

(async () => {
  try {
    // Connect to MongoDB Atlas using URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected");

    // Log the data to be inserted
    console.log('Data to be inserted:', data);

    // Optional: Clear existing data
    await project.deleteMany({});
    console.log("Existing data cleared");

    // Insert data
    const result = await project.insertMany(data);
    console.log(`${result.length} documents were inserted`);

    // Fetch and display projects
    const projects = await project.find({});
    console.log('Projects:', projects);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
})();




