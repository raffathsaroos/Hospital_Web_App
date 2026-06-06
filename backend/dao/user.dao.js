import User from '../models/user.model.js';

const findUserByEmail = (email) => User.findOne({ email });

const findUserByEmailWithPassword = (email) => User.findOne({ email }).select('+password');

const createUser = (userData) => User.create(userData);

export default {
	findUserByEmail,
	findUserByEmailWithPassword,
	createUser
};
