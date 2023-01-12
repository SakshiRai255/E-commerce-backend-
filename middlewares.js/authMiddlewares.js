import User from "../modals/userSchema";
import JWT from "jsonwebtoken";
import asyncHandler from "../services/asyncHandler.js";
import customError from "../utils/customError";
import config from "../config/index";

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  let token;
  if (
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer"))
  ) {
    token = req.cookies.token || req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new customError("Not authorized to access this route", 401);
  }
  try {
    const decodeJwtPayload = JWT.verify(token, config.JWT_SECRET);
    // 
    req.user = await User.findById(decodeJwtPayload._id, "name email role")
    next();
  } catch (error) {
    throw new customError("Not authorized to access this route", 401);
  }
});
