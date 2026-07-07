// Creates middleware that allows only the listed account roles.
export const authorize = (...allowedRoles) => {
  // Checks the verified user's role before the route runs.
  return (req, res, next) => {
    // A role check needs an authenticated user first.
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Stop users whose role is outside this route's access list.
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};
