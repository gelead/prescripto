import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import validator from "validator";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
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
      !degree
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
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      image: imageUrl,
      date: Date.now(),
    });

    await newDoctor.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        speciality: newDoctor.speciality,
        degree: newDoctor.degree,
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

export { addDoctor, loginAdmin };
