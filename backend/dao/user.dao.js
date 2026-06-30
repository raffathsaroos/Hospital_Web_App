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

// Saves validated changes and returns the fresh account.
const updateUserById = (id, userData) =>
  User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });

// Permanently removes one user account.
const deleteUserById = (id) => User.findByIdAndDelete(id);

export default {
  findUserByEmail,
  findUserByUniqueFields,
  createUser,
  updateUserById,
  deleteUserById,
};
