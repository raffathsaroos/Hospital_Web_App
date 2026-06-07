export const authorize = (...allowedRoles) => {
	return (req, res, next) => {
		// Authentication middleware must run before this
		if (!req.user) {
			return res.status(401).json({
				message: "Authentication required.",
			});
		}

		// Check whether logged-in user's role is allowed
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				message: "You do not have permission to perform this action.",
			});
		}

		next();
	};
};