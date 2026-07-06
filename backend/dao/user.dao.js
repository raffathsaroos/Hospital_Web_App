import User from '../models/user.model.js';

// Finds an account by email and reveals its password only for login.
const findUserByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  return includePassword ? query.select('+password') : query;
};

// Finds a user that matches any unique identity field.
const findUserByUniqueFields = ({ email, phone, nic }, excludeId) => {
  const conditions = [];

  if (email) conditions.push({ email: email.toLowerCase().trim() });
  if (phone) conditions.push({ phone: phone.trim() });
  if (nic) conditions.push({ nic: nic.trim() });

  if (conditions.length === 0) return null;

  const query = { $or: conditions };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return User.findOne(query);
};

// Inserts one user account.
const createUser = (userData) => User.create(userData);

const findUsers = (filter = {}) =>
  User.find(filter).sort({ createdAt: -1 });

const findUserById = (id, includePassword = false) => {
  const query = User.findById(id);
  return includePassword ? query.select('+password') : query;
};

// Saves validated changes and returns the fresh account.
const updateUserById = async (id, userData) => {
  // Password changes must pass through the model save hook.
  if (userData.password !== undefined) {
    const user = await User.findById(id).select('+password');
    if (!user) return null;
    Object.assign(user, userData);
    await user.save();
    user.password = undefined;
    return user;
  }
  return User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
};

// Permanently removes one user account.
const deleteUserById = (id) => User.findByIdAndDelete(id);

export default {
  findUserByEmail,
  findUserByUniqueFields,
  createUser,
  findUsers,
  findUserById,
  updateUserById,
  deleteUserById,
};
