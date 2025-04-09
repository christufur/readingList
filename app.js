const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Initialize Express
const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

// Only connect if not already connected
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log('MongoDB connection error:', err));
}

// Import the Book model
const Book = require('./models/book');

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

// ===== API ROUTES =====
// These must come BEFORE the static middleware

// POST route to create a new book
// Update your POST route to create a book
app.post('/book', async(req, res) => {
    try {
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            publishYear: req.body.publishYear,
            status: req.body.status,
            tags: req.body.tags
        });

        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch(error){
        res.status(400).json({message: error.message});
    }
});

// GET route to retrieve all books
app.get('/books', async (req, res) => {
    try {
      const books = await Book.find();
      
      // Make sure books is an array before sending
      if (!Array.isArray(books)) {
        console.error('Books is not an array:', books);
        return res.status(500).json({ error: 'Data format error' });
      }
      
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: error.message });
    }
});


// POST route as an alternative to DELETE
app.post('/book/delete/:id', async(req, res) => {
    try {
        const bookId = req.params.id;
        console.log(`Attempting to delete book with ID: ${bookId}`);
        
        const deletedBook = await Book.findByIdAndDelete(bookId);
        
        if (!deletedBook) {
            console.log(`Book with ID ${bookId} not found`);
            return res.status(404).json({ message: "Book not found" });
        }
        
        console.log(`Successfully deleted book: ${deletedBook.title}`);
        return res.json({ message: "Book deleted successfully" });
    } catch(error){
        console.error(`Error deleting book: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

// POST route to update book status
app.post('/book/update/:id', async(req, res) => {
    try {
        const bookId = req.params.id;
        const { status } = req.body;
        
        console.log(`Attempting to update status for book ID: ${bookId} to ${status}`);
        
        const updatedBook = await Book.findByIdAndUpdate(
            bookId, 
            { status: status },
            { new: true }
        );
        
        if (!updatedBook) {
            console.log(`Book with ID ${bookId} not found`);
            return res.status(404).json({ message: "Book not found" });
        }
        
        console.log(`Successfully updated book status: ${updatedBook.title} to ${status}`);
        return res.json(updatedBook);
    } catch(error){
        console.error(`Error updating book: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
});

// Static file middleware - AFTER API routes but BEFORE HTML routes
app.use(express.static(path.join(__dirname, 'public')));

// ===== HTML ROUTES =====
// These routes serve the HTML pages

// Root route - redirect to upload page
app.get('/', (req, res) => {
    res.redirect('/upload');
});

// Route for the upload page
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

// Route for the list page
app.get('/list', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'list.html'));
});

// Route for the query page
app.get('/query', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'query.html'));
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

// Start the server
const PORT = process.env.PORT || 26053;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});