import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "./../models/appointmentModel.js";

// ✅ Toggle doctor availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    // Validate request
    if (!docId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required" });
    }

    // Find doctor by ID
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Toggle availability status
    doctor.available = !doctor.available;
    await doctor.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Availability changed successfully",
      availability: doctor.available,
    });
  } catch (error) {
    console.error("Error changing doctor availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Fetch all doctors
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password -email");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Doctor is not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    // Check credentials
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        success: true,
        token,
        doctorId: doctor._id,
        message: "Doctor logged in successfully",
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

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId || req.body?.docId;
    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }
    const appointments = await appointmentModel.find({ docId }).populate('userData', 'name email image dateOfBirth');
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId; // Get doctor ID from authenticated token

    // Input validation
    if (!appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Check if the appointment belongs to the doctor
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: This appointment does not belong to you" 
      });
    }

    // Check if already completed
    if (appointmentData.isCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already completed" 
      });
    }

    // Check if cancelled
    if (appointmentData.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot complete a cancelled appointment" 
      });
    }

    await appointmentModel.findByIdAndUpdate(
      appointmentId, 
      { 
        isCompleted: true, 
        completedAt: new Date() 
      }
    );

    return res.json({ 
      success: true, 
      message: "Appointment marked as completed" 
    });

  } catch (error) {
    console.error("Appointment complete error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });    
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;
    const docId = req.docId; // Get doctor ID from authenticated token

    // Input validation
    if (!appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    
    if (!appointmentData) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Check if the appointment belongs to the doctor
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: This appointment does not belong to you" 
      });
    }

    // Check if already completed
    if (appointmentData.isCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel a completed appointment" 
      });
    }

    // Check if already cancelled
    if (appointmentData.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    await appointmentModel.findByIdAndUpdate(
      appointmentId, 
      { 
        cancelled: true,
        cancelledAt: new Date(),
        cancellationReason: reason || "Cancelled by doctor"
      }
    );

    return res.json({ 
      success: true, 
      message: "Appointment cancelled successfully" 
    });

  } catch (error) {
    console.error("Appointment cancel error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });    
  }
};

export { 
  changeAvailability, 
  doctorList, 
  loginDoctor, 
  appointmentsDoctor, 
  appointmentComplete, 
  appointmentCancel // Fixed typo: was appointmentCancelled
};