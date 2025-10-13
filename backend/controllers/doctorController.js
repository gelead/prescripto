import doctorModel from "../models/doctorModel.js"; // keep .js in ES modules

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

export { changeAvailability, doctorList };
