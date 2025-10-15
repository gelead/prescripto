import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import doctorModel from "./../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ==============================
// Register User
// ==============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    // Check password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("Error while registering user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

// ==============================
// Login User
// ==============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error("Error while logging in:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

// ==============================
// Get User Profile
// ==============================
const getProfile = async (req, res) => {
  try {
    const { userId: bodyUserId } = req.body || {};
    const { userId: queryUserId } = req.query || {};
    const userId = bodyUserId || queryUserId || req.userId; // support GET (no body)

    const user = await userModel.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, userData: user });
  } catch (error) {
    console.error("Error while fetching profile:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

// ==============================
// Update User Profile
// ==============================
const updateProfile = async (req, res) => {
  try {
    const { userId: bodyUserId } = req.body || {};
    const userId = bodyUserId || req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }
    const { name, phone, address, dateOfBirth, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const updateData = {
      name,
      phone,
      address: typeof address === "string" ? JSON.parse(address) : address,
      dateOfBirth,
      gender,
    };

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "profile_images",
        width: 150,
      });
      updateData.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error while updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // Fetch doctor
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData || !docData.available) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Fetch user
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle slots_booked
    let slots_booked = docData.slots_booked || new Map();

    if (slots_booked.has(slotDate)) {
      if (slots_booked.get(slotDate).includes(slotTime)) {
        return res.status(400).json({ success: false, message: "Slot already booked" });
      } else {
        slots_booked.get(slotDate).push(slotTime);
      }
    } else {
      slots_booked.set(slotDate, [slotTime]);
    }

    // Update doctor with new slots
    await doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked: Object.fromEntries(slots_booked) },
      { new: true }
    );

    // Create appointment
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    res.status(200).json({ success: true, message: "Appointment booked successfully" });

  } catch (error) {
    console.error("Error while booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// API to get user appointments for frontend my-appointment page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found in request" });
    }

    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error while fetching appointments list", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==============================
// Cancel Appointment
// ==============================
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params; // Get appointment ID from URL params
    const userId = req.userId; // From auth middleware

    console.log("Cancelling appointment:", id, "for user:", userId); // Debug log

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid appointment ID format" 
      });
    }

    // Find the appointment
    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    console.log("Found appointment:", appointment); // Debug log

    // Check if user owns this appointment
    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only cancel your own appointments" 
      });
    }

    // Check if already cancelled
    if (appointment.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    // Free up the doctor's slot
    const doctor = await doctorModel.findById(appointment.docId);
    if (doctor && doctor.slots_booked) {
      console.log("Doctor slots before cancellation:", doctor.slots_booked); // Debug log
      
      let slots_booked = doctor.slots_booked;
      
      // Convert to Map if it's stored as object
      if (slots_booked && typeof slots_booked === 'object' && !(slots_booked instanceof Map)) {
        slots_booked = new Map(Object.entries(slots_booked));
      }

      if (slots_booked && slots_booked.has(appointment.slotDate)) {
        const times = slots_booked.get(appointment.slotDate);
        const updatedTimes = times.filter(time => time !== appointment.slotTime);
        
        if (updatedTimes.length === 0) {
          slots_booked.delete(appointment.slotDate);
        } else {
          slots_booked.set(appointment.slotDate, updatedTimes);
        }

        // Update doctor's slots
        await doctorModel.findByIdAndUpdate(
          appointment.docId,
          { slots_booked: Object.fromEntries(slots_booked) },
          { new: true }
        );

        console.log("Doctor slots after cancellation:", Object.fromEntries(slots_booked)); // Debug log
      }
    }

    // Update appointment status
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      id,
      { 
        cancelled: true,
        status: "cancelled",
        cancelledAt: new Date()
      },
      { new: true }
    );

    console.log("Appointment cancelled successfully:", updatedAppointment); // Debug log

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Error while cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment };
