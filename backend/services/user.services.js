import userDao from '../dao/user.dao.js';

// Services handle account rules before asking the DAO to access MongoDB.
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
			firstName: createdUser.firstName,
			lastName: createdUser.lastName,
			email: createdUser.email,
			role: createdUser.role
		}
	};
};

const loginUser = async ({ email, password }) => {
	const user = await userDao.findUserByEmail(email, true);

	if (!user || user.password !== password) {
		const error = new Error('Invalid email or password.');
		error.statusCode = 401;
		throw error;
	}

	return {
		message: 'Login successful!',
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		role: user.role
	};
};

export default {
	signupUser,
	loginUser
};
