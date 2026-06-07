import User from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  //Reject inactive user
  if (!user.isActive) {
    throw new Error("Your account is inactive. Please contact admin.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password.");
  }

  //  Update last login time
  user.lastLogin = new Date();
  await user.save();

  
  const token = signToken({
    userId: user._id,
    role: user.role,
  });

  
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