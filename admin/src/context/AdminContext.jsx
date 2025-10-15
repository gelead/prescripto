import { createContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Function to get all doctors
  const getAllDoctors = useCallback(async () => {
    try {
      setLoading(true);
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
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Something went wrong while getting doctors list.");
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  const changeAvailability = useCallback(async (docId) => {
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
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error changing availability:", error);
      toast.error("Something went wrong while changing availability.");
    }
  }, [aToken, backendUrl, getAllDoctors]);

  const getAllAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: {
          Authorization: aToken,
        },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Something went wrong while getting appointments.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  // ✅ Function to cancel appointment (Admin)
  const cancelAppointment = useCallback(async (appointmentId) => {
    try {
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

        // Update the appointments list locally
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

        // Also update dashData if it exists
        setDashData(prev => prev ? {
          ...prev,
          latestAppointment: prev.latestAppointment?.map(apt =>
            apt._id === appointmentId
              ? {
                  ...apt,
                  cancelled: true,
                  status: "cancelled",
                  cancelledAt: new Date(),
                }
              : apt
          )
        } : prev);

        return data.appointment;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while cancelling the appointment.");
      }
      return null;
    }
  }, [aToken, backendUrl]);

  const getDashData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: {
          Authorization: aToken,
        },
      });
      if (data.success) {
        setDashData(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Something went wrong while getting dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl, loading]);

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
    cancelAppointment,
    dashData,
    getDashData,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;