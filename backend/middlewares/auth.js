// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.student) {
      return next();
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  };
  
  module.exports = { isAuthenticated };