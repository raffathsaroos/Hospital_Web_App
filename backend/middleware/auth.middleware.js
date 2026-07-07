import User from "../models/user.model.js";
import { verifyToken } from "../utils/jwt.js";

// Loads the active user named by a valid bearer token.
export const authenticate = async (req, res, next) => {
  try {
    // Read the token sent by the API client.
    const authHeader = req.headers.authorization;

    // Reject missing tokens and unsupported header formats.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please login.",
      });
    }

    // Keep only the signed token value.
    const token = authHeader.split(" ")[1];

    // Decode trusted identity data from the token.
    const decoded = verifyToken(token);

    // Reload the account so old token data cannot bypass changes.
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    // Disabled accounts lose access at once.
    if (!user.isActive) {
      return res.status(401).json({
        message: "User account is inactive.",
      });
    }

    // Share the verified account with later middleware.
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};
