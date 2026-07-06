import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "100m";

// Signs trusted login data with the configured expiry time.
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Reads a token only when its signature and expiry are valid.
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
