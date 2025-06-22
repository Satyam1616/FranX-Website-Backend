const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Welcome to FranX Website API' });
});

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://franx_admin:franx.mongoDB@cluster0.vpnyyed.mongodb.net/franx_website?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  service: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);
const Review = mongoose.model('Review', reviewSchema);

// Test route to verify API is working
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Routes
app.post('/api/contact', async (req, res) => {
  console.log('Contact form submission received:', req.body);
  try {
    const { name, email, subject, message, service } = req.body;
    
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      service
    });

    await contact.save();
    console.log('Contact saved successfully');

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to yourself
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        // Don't block the user response for email error
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Error sending message. Please try again.' });
  }
});

// GET endpoint to view all submissions
app.get('/api/contacts', async (req, res) => {
  console.log('Fetching all contacts');
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    console.log(`Found ${contacts.length} contacts`);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Reviews endpoints
app.post('/api/reviews', async (req, res) => {
  console.log('Review submission received:', req.body);
  try {
    const { name, rating, review } = req.body;
    
    const newReview = new Review({
      name,
      rating,
      review
    });

    await newReview.save();
    console.log('Review saved successfully');

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to yourself
      subject: `New Review Submission from ${name}`,
      html: `
        <h1>New Review Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Rating:</strong> ${rating}</p>
        <p><strong>Review:</strong></p>
        <p>${review}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Error submitting review. Please try again.' });
  }
});

app.get('/api/reviews', async (req, res) => {
  console.log('Fetching all reviews');
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Handle 404 routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.url);
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.url,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the API`);
  console.log(`Available routes:`);
  console.log(`- GET  /`);
  console.log(`- GET  /test`);
  console.log(`- POST /api/contact`);
  console.log(`- GET  /api/contacts`);
  console.log(`- POST /api/reviews`);
  console.log(`- GET  /api/reviews`);
}); 