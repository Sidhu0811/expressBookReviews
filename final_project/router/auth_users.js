
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const JWT_SECRET = 'fingerprint_customer';

// Check whether the username is available
const isValid = (username) => {
  if (typeof username !== 'string' || !username.trim()) {
    return false;
  }

  return !users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    user =>
      user.username === username &&
      user.password === password
  );
};

// Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'User successfully logged in',
    token
  });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session?.username || req.user?.username;
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!username) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  if (review === undefined || review === null || review === '') {
    return res.status(400).json({
      message: 'Review is required'
    });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
