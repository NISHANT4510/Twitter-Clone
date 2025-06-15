import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Make sure id is available in both standard formats
    if (verified._id && !verified.id) {
      verified.id = verified._id;
    } else if (verified.id && !verified._id) {
      verified._id = verified.id;
    }
    
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
