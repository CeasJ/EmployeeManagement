const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied: no Authorization header provided' });
  }

  let token;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = authHeader;
  }
  
  
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return res.status(401).json({ error: 'Access denied: invalid or missing token' });
  }

  const jwtSecret = process.env.JWT_KEY;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {

    const decoded = jwt.verify(token, jwtSecret);
    
    if (!decoded.phoneNumber && !decoded.email) {
      return res.status(401).json({ error: 'Invalid token: missing phoneNumber or email' });
    }
    
    req.user = decoded;

    next();
    
  } catch (error) {
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        expiredAt: error.expiredAt 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token format: ' + error.message 
      });
    }
    
    return res.status(401).json({ 
      error: 'Authentication error: ' + error.message 
    });
  }
};