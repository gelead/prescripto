import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the decoded user is the real admin
    if (
      decoded.email === process.env.ADMIN_EMAIL &&
      decoded.role === "admin"
    ) {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized: Invalid admin" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authAdmin;
