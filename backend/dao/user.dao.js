import User from '../models/user.model.js';

// Database access stays here so services can focus on business rules.
const findUserByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  return includePassword ? query.select('+password') : query;
};

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

const createUser = (userData) => User.create(userData);

const updateUserById = (id, userData) =>
  User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });

const deleteUserById = (id) => User.findByIdAndDelete(id);

export default {
  findUserByEmail,
  findUserByUniqueFields,
  createUser,
  updateUserById,
  deleteUserById,
};
