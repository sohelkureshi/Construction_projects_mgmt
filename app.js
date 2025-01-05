const express = require("express");
const app = express();
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const projectroutes = require('./routes/project');
const billroutes = require('./routes/bill');
const progressroutes = require('./routes/progress');

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connection to MongoDB Atlas successful!");
    })
    .catch(error => {
        console.log("Oh no, error!");
        console.log(error);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// EJS setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));

// Middleware
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/project', projectroutes);
app.use('/project/:id/bill', billroutes);
app.use('/project/:id/progress', progressroutes);

// Route Handlers
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/drawings', (req, res) => {
    res.render('drawings');
});

// Start server
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}!`);
});
