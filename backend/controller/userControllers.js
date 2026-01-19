import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionModel.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({id:newUser._id},process.env.SECRET_KEY,{expiresIn:"10m"})
    verifyEmail(token,email)
    newUser.token = token;
await newUser.save()
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(400).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1]; // [Bearer, fch89er9ue8freh8]
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Generate new verification token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    // 3️⃣ Send verification email again
    await verifyEmail(token, email);

    // 4️⃣ (Optional) save token in DB
    user.token = token;
    await user.save();

    // 5️⃣ Response
    return res.status(200).json({
      success: true,
      message: "Verification email sent again successfully",
      token: user.token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not exists",
      });
    }

    // 3️⃣ Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // 4️⃣ Check email verification
    if (existingUser.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Verify your account then login",
      });
    }

    // 5️⃣ Generate tokens
    const accessToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" },
    );

    const refreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    // 6️⃣ Update login status
    existingUser.isLoggedIn = true;
    await existingUser.save();

    // 7️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
    });

    // Check for exisiting session and delete it
const existingSession = await Session.findOne({userId:exisitingUser._id})
if(existingSession){
    await Session.deleteOne({userId:exisitingUser._id})
}

// Create a new session
await Session.create({userId:exisitingUser._id})
return res.status(200).json({
    success:true,
    message: `Welcome back ${exisitingUser.firstName}`,
    user:exisitingUser,
    accessToken,
    refreshToken
})

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
