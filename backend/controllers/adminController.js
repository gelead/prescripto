import bcrypt from 'bcrypt';
import Doctor from '../models/doctorModel.js';
import validator from 'validator';

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file; // multer file

    if (!name || !email || !password || !speciality || !fees || !address || !imageFile || !experience || !about || !degree) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if(!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: imageFile?.path,
    });

    await newDoctor.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { addDoctor };
