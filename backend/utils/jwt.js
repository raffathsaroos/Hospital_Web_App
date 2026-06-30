import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "10m";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env file");
}

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
