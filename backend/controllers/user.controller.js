import userService from '../services/user.services.js';

// Sends a signup request through the account service.
const signup = async (req, res) => {
	try {
		const result = await userService.signupUser(req.body);
		res.status(201).json({ message: result.message, user: result.user });
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error during signup.'
		});
	}
};

// Returns account details after a valid login.
const login = async (req, res) => {
	try {
		const result = await userService.loginUser(req.body);
		res.status(200).json(result);
	} catch (error) {
		res.status(error.statusCode || 500).json({
			message: error.message || 'Server error during login.'
		});
	}
};

export default {
	signup,
	login
};
