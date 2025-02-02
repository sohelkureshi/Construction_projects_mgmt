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
    // console.log$&;

    // Log the data to be inserted
    // console.log$&;

    // Optional: Clear existing data
    await project.deleteMany({});
    // console.log$&;

    // Insert data
    const result = await project.insertMany(data);
    // console.log$&;

    // Fetch and display projects
    const projects = await project.find({});
    // console.log$&;
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    // console.log$&;
  }
})();




