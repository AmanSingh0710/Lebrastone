const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // ✅ KEY UPDATE: 'super_secret_admin_key' ka use karein
    const decoded = jwt.verify(token, 'super_secret_admin_key'); 
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};