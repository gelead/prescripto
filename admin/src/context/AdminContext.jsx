import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);

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
      const { data } = await axios.post(backendUrl + "/api/admin/change-availability", {
        docId
      }, {
        headers: {
          Authorization: aToken
        }
      });
      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // Refresh the doctors list to reflect the change
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error changing availability:", error);
      toast.error("Something went wrong while changing availability.");
    }
  }
  // ✅ Provide context values
  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
