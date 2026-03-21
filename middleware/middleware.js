// import jwt from "jsonwebtoken"

// const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "No token provided" })
//         }

//         const token = authHeader.split(" ")[1]

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET_KEY
//         )
        
//         req.user = decoded // attach user to request

//         next()
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" })
//   }
// };

// export default protect

import jwt from "jsonwebtoken";
import User from "../models/taskUser.js"

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // ✅ now has _id

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized" });
    }
  } else {
    res.status(401).json({ message: "No token" });
  }
};

export default protect;