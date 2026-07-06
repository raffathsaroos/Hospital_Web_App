import userDao from '../dao/user.dao.js';
import { signToken } from '../utils/jwt.js';
import { USER_ROLES } from '../constants/roles.const.js';

const createError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const safeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  nic: user.nic,
  dob: user.dob,
  gender: user.gender,
  role: user.role,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
});

const loginUser = async ({ email, password }) => {
  if (!email || !password) throw createError('Email and password are required.', 400);
  const user = await userDao.findUserByEmail(email, true);
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password.', 401);
  }
  if (!user.isActive) throw createError('Your account is inactive. Please contact admin.', 403);
  // Transparently migrate legacy plain-text records after a valid login.
  if (!user.password.startsWith('scrypt:')) user.password = password;
  user.lastLogin = new Date();
  await user.save();
  return { message: 'Login successful.', token: signToken({ userId: user._id, role: user.role }), user: safeUser(user) };
};

const createUser = async (data) => {
  if (!USER_ROLES.includes(data.role)) throw createError('Invalid role.', 400);
  const duplicate = await userDao.findUserByUniqueFields(data);
  if (duplicate) throw createError('Email, phone, or NIC is already in use.', 409);
  const user = await userDao.createUser(data);
  return safeUser(user);
};

const getUsers = async (query) => {
  const filter = {};
  if (query.role) {
    if (!USER_ROLES.includes(query.role)) throw createError('Invalid role.', 400);
    filter.role = query.role;
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return (await userDao.findUsers(filter)).map(safeUser);
};

const getUser = async (id) => {
  const user = await userDao.findUserById(id);
  if (!user) throw createError('User not found.', 404);
  return safeUser(user);
};

const updateUser = async (id, data) => {
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'nic', 'dob', 'gender', 'password', 'role', 'avatar'];
  const updates = Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key)));
  if (updates.role && !USER_ROLES.includes(updates.role)) throw createError('Invalid role.', 400);
  const duplicate = await userDao.findUserByUniqueFields(updates, id);
  if (duplicate) throw createError('Email, phone, or NIC is already in use.', 409);
  const user = await userDao.findUserById(id, true);
  if (!user) throw createError('User not found.', 404);
  Object.assign(user, updates);
  await user.save();
  return safeUser(user);
};

const setUserStatus = async (id, isActive, actorId) => {
  if (typeof isActive !== 'boolean') throw createError('isActive must be a boolean.', 400);
  if (id === actorId.toString() && !isActive) throw createError('You cannot deactivate your own account.', 409);
  const user = await userDao.updateUserById(id, { isActive });
  if (!user) throw createError('User not found.', 404);
  return safeUser(user);
};

export default { loginUser, createUser, getUsers, getUser, updateUser, setUserStatus };
