const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid auth scheme" });
  }

  const token = parts[1];

  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    if (user.status === "Inactive") return res.status(403).json({ message: "Account deactivated" });
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalid or expired"
    });
  }
};

module.exports = auth;