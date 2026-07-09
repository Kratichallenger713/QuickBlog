import jwt from "jsonwebtoken";

// ===========================
// Admin-Only Auth Middleware
// ===========================
// Admin JWT payload contains { email } (set in adminController.js)
// This is separate from user auth (which contains { id })
// Using a dedicated middleware keeps admin and user auth completely isolated

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin token carries { email }, check it matches the env admin email
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default adminAuth;
