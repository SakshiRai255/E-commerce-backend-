import User from "../modals/userSchema.js";
import asyncHandler from "../services/asyncHandler.js";
import customError from "../utils/customError.js";
import mailHelper from "../utils/mailHelper";
import crypto from "crypto";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

// SignUp

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new customError("Please fill all fields", 400);
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new customError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

// Log In

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new customError("Please fill all fields',400");
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new customError("Invalid Credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  }
  throw new customError("Invalid Credentials - pass", 400);
});

// Log Out

export const logout = asyncHandler(async (_req, res) => {
  // res.clearCookie()
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//  Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email });
  if (!user) {
    throw new customError("User not Found", 400);
  }
  const resetToken = user.generateForgotPasswordToken();
  await user.save({ ValidateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/password/reset${resetToken}`;

  const text = `Your password reset url is \n\n ${resetUrl}\n\n`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email}`,
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ ValidateBeforeSave: false });

    throw new customError(error.message || "Email sent failure", 500);
  }
});

// Reset Password

export const resetPassword = asyncHandler(async (req, res) => {
  const { token: resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // User.findOne({email:email})

  const user = await User.findOne({
    forgotPasswordToken: resetToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new customError("Password token in invalid or expired", 400);
  }

  if (password !== confirmPassword) {
    throw new customError("Password and Confirm Password does not match");
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  const token = user.getJwtToken()
  user.password = user.undefined

  res.cookie("token",token,cookieOptions)
  res.status(200).json({
    success:true,
    user
  })
});

// Get Profile

export const getProfile = asyncHandler(async(req,res)=>{
  const {user} = req
  if (!user) {
    throw new customError("User not Found",404);
  }
  res.status(200).json({
    success: true,
    user
  })
})