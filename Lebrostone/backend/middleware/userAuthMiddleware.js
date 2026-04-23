const User = require('../models/User');

// User authentication middleware for session-based auth
exports.userProtect = async (req, res, next) => {
  try {
    // Check if user is logged in by checking localStorage equivalent
    // In this case, we'll check if there's a valid user session
    const userToken = req.headers.authorization;
    
    if (!userToken || userToken !== 'active-session') {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized, please login" 
      });
    }

    // Since we're using session-based auth, we'll get user ID from query param or body
    // This is a simplified approach for the current system
    if (req.body && req.body.userId) {
      req.user = { id: req.body.userId };
      next();
    } else if (req.query && req.query.userId) {
      req.user = { id: req.query.userId };
      next();
    } else {
      // For routes that need user context, we'll allow them to proceed
      // but they should handle user identification themselves
      next();
    }
  } catch (error) {
    console.error('User auth error:', error);
    res.status(401).json({ 
      success: false,
      message: "Not authorized, token failed" 
    });
  }
};

// Alternative middleware that checks for user existence in database
exports.validateUser = async (req, res, next) => {
  try {
    // Extract user ID from request (this will be set by the frontend)
    let userId = null;
    
    // Check various sources for user ID
    if (req.headers['x-user-id']) {
      userId = req.headers['x-user-id'];
    } else if (req.body && req.body.userId) {
      userId = req.body.userId;
    } else if (req.query && req.query.userId) {
      userId = req.query.userId;
    }
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User ID required for authentication" 
      });
    }

    // Verify user exists in database
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been blocked. Please contact admin." 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('User validation error:', error);
    res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};