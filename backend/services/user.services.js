import userDao from '../dao/user.dao.js';

const signupUser = async (userData) => {
	const existingUser = await userDao.findUserByEmail(userData.email);

	if (existingUser) {
		const error = new Error('User already exists.');
		error.statusCode = 400;
		throw error;
	}

	const createdUser = await userDao.createUser(userData);

	return {
		message: 'User created successfully!',
		user: {
			email: createdUser.email,
			username: createdUser.username
		}
	};
};

const loginUser = async ({ email, password }) => {
	const user = await userDao.findUserByEmail(email);

	if (!user || user.password !== password) {
		const error = new Error('Invalid email or password.');
		error.statusCode = 401;
		throw error;
	}

	return {
		message: 'Login successful!',
		email: user.email,
		username: user.username
	};
};

export default {
	signupUser,
	loginUser
};
