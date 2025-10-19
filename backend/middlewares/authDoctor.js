import jwt from "jsonwebtoken";

export const authDoctor = async (req, res, next) => {
  try {
     const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Unauthorized: No token provided" });
    
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        req.docId = decoded.id; // <-- use this
    
        next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
