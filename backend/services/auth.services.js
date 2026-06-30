import User from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";

// Verifies an active account and creates its login token.
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // Inactive accounts cannot start a new session.
  if (!user.isActive) {
    throw new Error("Your account is inactive. Please contact admin.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password.");
  }

  // Save the latest successful login time.
  user.lastLogin = new Date();
  await user.save();

  // Put only the identity needed for access checks in the token.
  const token = signToken({
    userId: user._id,
    role: user.role,
  });

  // Never return the stored password with login details.
  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};
