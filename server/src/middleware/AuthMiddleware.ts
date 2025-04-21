import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define custom type for authenticated request
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export default function(req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret') as { user: { id: string } };
    
    // Set user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}