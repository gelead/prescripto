import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Function to get all doctors
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        {
          headers: {
            Authorization: aToken,
          },
        }
      );

      if (data.success) {
        setDoctors(data.doctors);
        console.log("Doctors list fetched:", data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Something went wrong while getting doctors list.");
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        {
          docId,
        },
        {
          headers: {
            Authorization: aToken,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // Refresh the doctors list to reflect the change
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error changing availability:", error);
      toast.error("Something went wrong while changing availability.");
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: {
          Authorization: aToken,
        },
      });
      if (data.success) {
        setAppointments(data.appointments);
        console.log("Appointments fetched:", data.appointments);
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Something went wrong while getting appointments.");
      return [];
    }
  };

  // ✅ Function to cancel appointment (Admin)
  const cancelAppointment = async (appointmentId) => {
    try {
      console.log("Cancelling appointment:", appointmentId); // Debug log

      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },

        {
          headers: {
            Authorization: aToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        console.log("Appointment cancelled successfully:", data.appointment);

        // Update the appointments list locally instead of refetching all
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  cancelled: true,
                  status: "cancelled",
                  cancelledAt: new Date(),
                }
              : apt
          )
        );

        return data.appointment;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while cancelling the appointment.");
      }

      return null;
    }
  };

  // ✅ Provide context values
  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment, // Add the new function
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
