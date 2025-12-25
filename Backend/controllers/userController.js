import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { fullname, phoneNumber, password, role } = req.body;

    if (!phoneNumber || !fullname || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Extract firstname and lastname from fullname
    const { firstname, lastname } = fullname;

    if (!firstname || !lastname) {
      return res.status(400).json({ message: "Firstname and lastname are required" });
    }

    const userExists = await User.findOne({ phoneNumber });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      fullname: { firstname, lastname },
      phoneNumber,
      password: hashed,
      role: role || "user",
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// Login handler
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

  // include password because schema sets select: false on password
  const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful", token, user: { id: user._id, fullname: user.fullname, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout handler
export const logout = (req, res) => {
  res.clearCookie("token");
  console.log("LOgout Successfull")
  return res.json({ success: true, message: "Logout successfully" });
  
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
