import express from 'express';
import { 
  appointmentsDoctor, 
  doctorList, 
  loginDoctor, 
  appointmentComplete, 
  appointmentCancel, 
  doctorDashboard, 
  doctorProfile, 
  updateDoctorProfile 
} from '../controllers/doctorController.js';
import { authDoctor } from './../middlewares/authDoctor.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // or use diskStorage if you prefer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor);
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete);
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel);
doctorRouter.get('/dashboard', authDoctor, doctorDashboard);
doctorRouter.get('/profile', authDoctor, doctorProfile);
doctorRouter.post('/update-profile', authDoctor, upload.single('image'), updateDoctorProfile);

export default doctorRouter;