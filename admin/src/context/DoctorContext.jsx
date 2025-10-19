import { useState, useCallback } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(
    localStorage.getItem("doctorId") ? localStorage.getItem("doctorId") : ""
  );

  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // Memoize getAppointments
  const getAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        {
          headers: { Authorization: dToken },
        }
      );
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }, [dToken, backendUrl]);

  // Memoize completeAppointment
  const completeAppointment = useCallback(
    async (appointmentId) => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/doctor/complete-appointment",
          {
            appointmentId: appointmentId,
          },
          {
            headers: { Authorization: dToken },
          }
        );

        if (data.success) {
          toast.success(data.message);
          setAppointments((prevAppointments) =>
            prevAppointments.map((appointment) =>
              appointment._id === appointmentId
                ? { ...appointment, isCompleted: true }
                : appointment
            )
          );
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error completing appointment:", error);
        toast.error(
          error.response?.data?.message || "Failed to complete appointment"
        );
      }
    },
    [dToken, backendUrl]
  );

  // Memoize cancelAppointment
  const cancelAppointment = useCallback(
    async (appointmentId, reason = "Cancelled by doctor") => {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/doctor/cancel-appointment",
          {
            appointmentId: appointmentId,
            reason: reason,
          },
          {
            headers: { Authorization: dToken },
          }
        );

        if (data.success) {
          toast.success(data.message);
          setAppointments((prevAppointments) =>
            prevAppointments.map((appointment) =>
              appointment._id === appointmentId
                ? {
                    ...appointment,
                    cancelled: true,
                    cancellationReason: reason,
                  }
                : appointment
            )
          );
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error(
          error.response?.data?.message || "Failed to cancel appointment"
        );
      }
    },
    [dToken, backendUrl]
  );

  // Update doctor profile
  const updateProfile = useCallback(async (formData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        formData,
        {
          headers: {
            Authorization: dToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setProfileData(data.doctor); // Update local state with new data
        return { success: true, doctor: data.doctor };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [dToken, backendUrl]);

  const setDoctorAuth = useCallback((token, id) => {
    setDToken(token);
    setDoctorId(id);
    localStorage.setItem("dToken", token);
    localStorage.setItem("doctorId", id);
  }, []);

  const clearDoctorAuth = useCallback(() => {
    setDToken("");
    setDoctorId("");
    setAppointments([]);
    setDashData(false);
    setProfileData(false);
    localStorage.removeItem("dToken");
    localStorage.removeItem("doctorId");
  }, []);

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { Authorization: dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/doctor/profile', {
        headers: { Authorization: dToken }
      });
      if (data.success) {
        setProfileData(data.profileData);
        console.log(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const value = {
    backendUrl,
    dToken,
    setDToken,
    doctorId,
    setDoctorId,
    setDoctorAuth,
    clearDoctorAuth,
    getAppointments,
    appointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    updateProfile, // Add the update function to context
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};
export default DoctorContextProvider;