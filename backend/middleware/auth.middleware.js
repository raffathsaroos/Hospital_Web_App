import User from "../models/user.model.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
	try {
		// 1. Read Authorization header
		const authHeader = req.headers.authorization;

		// 2. Check Bearer token format
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				message: "Authentication required. Please login.",
			});
		}

		// 3. Extract token
		const token = authHeader.split(" ")[1];

		// 4. Verify token
		const decoded = verifyToken(token);

		// 5. Find current user from database
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(401).json({
				message: "User no longer exists.",
			});
		}

		// 6. Reject inactive user
		if (!user.isActive) {
			return res.status(401).json({
				message: "User account is inactive.",
			});
		}

		// 7. Attach user to request
		req.user = user;

		next();
	} catch (error) {
		return res.status(401).json({
			message: "Invalid or expired token.",
		});
	}
};