import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import validator from "validator";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import appointmentModel from "./../models/appointmentModel.js";
import mongoose from "mongoose"; // Add this import


const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      education,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file; // multer file

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !fees ||
      !address ||
      !imageFile ||
      !experience ||
      !about ||
      !education
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "doctors",
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      speciality,
      education,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      image: imageUrl,
      date: Date.now(),
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        speciality: newDoctor.speciality,
        education: newDoctor.education,
        experience: newDoctor.experience,
        about: newDoctor.about,
        fees: newDoctor.fees,
        address: newDoctor.address,
        image: newDoctor.image,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// API For admin Login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check credentials
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        success: true,
        token,
        message: "Admin logged in successfully",
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel an appointment (Admin)
// API to cancel an appointment (Admin) - Updated for POST method with appointmentId in body
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    console.log("Admin cancelling appointment:", appointmentId); // Debug log

    if (!appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid appointment ID format" 
      });
    }

    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    console.log("Found appointment:", appointment); // Debug log

    // Check if already cancelled
    if (appointment.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    // Check if appointment is already completed
    if (appointment.isCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel a completed appointment" 
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
      appointmentId,
      { 
        cancelled: true,
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "Cancelled by admin"
      },
      { new: true }
    );

    console.log("Appointment cancelled successfully by admin:", updatedAppointment); // Debug log

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

export { addDoctor, loginAdmin, allDoctors, appointmentAdmin, appointmentCancel };
