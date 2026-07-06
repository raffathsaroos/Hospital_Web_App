import userService from '../services/user.services.js';

const sendError = (res, error) => {
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Validation failed.', errors: Object.values(error.errors).map(({ message }) => message) });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID.' });
  if (error.code === 11000) return res.status(409).json({ message: 'Email, phone, or NIC is already in use.' });
  return res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error.' });
};

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (error) { sendError(res, error); }
};

const login = handle(async (req, res) => res.json(await userService.loginUser(req.body)));
const getMe = handle(async (req, res) => res.json({ user: await userService.getUser(req.user._id) }));
const create = handle(async (req, res) => res.status(201).json({ message: 'User created successfully.', user: await userService.createUser(req.body) }));
const getAll = handle(async (req, res) => { const users = await userService.getUsers(req.query); res.json({ count: users.length, users }); });
const getById = handle(async (req, res) => res.json({ user: await userService.getUser(req.params.id) }));
const update = handle(async (req, res) => res.json({ message: 'User updated successfully.', user: await userService.updateUser(req.params.id, req.body) }));
const setStatus = handle(async (req, res) => res.json({ message: 'User status updated successfully.', user: await userService.setUserStatus(req.params.id, req.body.isActive, req.user._id) }));

export default { login, getMe, create, getAll, getById, update, setStatus };
