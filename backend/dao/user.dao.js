import User from '../models/user.model.js';

const findUserByEmail = (email) => User.findOne({ email });

const createUser = (userData) => User.create(userData);

export default {
	findUserByEmail,
	createUser
};
