
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: false,
    saveUninitialized: false
  })
);

// Verify the JWT for protected customer routes
app.use('/customer/auth/*', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token required'
    });
  }

  const token = authHeader.slice(7);

  jwt.verify(token, 'fingerprint_customer', (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
