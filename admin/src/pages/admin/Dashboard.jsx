import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "./../../assets/assets";

const Dashboard = () => {
  const { dashData, getDashData, aToken, cancelAppointment } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken, getDashData]);

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    const result = await cancelAppointment(appointmentId);
    if (result) {
      console.log("Appointment cancelled successfully");
      // Refresh dashboard data to reflect changes
      getDashData();
    }
  };

  // If no dashData, show loading or empty state
  if (!dashData) {
    return (
      <div className="w-full max-w-6xl m-5">
        <p className="mb-3 text-lg font-medium">Dashboard</p>
        <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto flex items-center justify-center">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Dashboard</p>
      
      {/* Stats Cards */}
      <div className="bg-white border rounded text-sm p-6 mb-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-4 bg-gray-50 p-5 min-w-52 rounded-lg border border-gray-200 hover:shadow-md transition-all">
            <img className="w-12" src={assets.doctor_icon} alt="Doctors" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.doctors || 0}
              </p>
              <p className="text-gray-500">Doctors</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-5 min-w-52 rounded-lg border border-gray-200 hover:shadow-md transition-all">
            <img className="w-12" src={assets.appointment_icon} alt="Appointments" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.appointments || 0}
              </p>
              <p className="text-gray-500">Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-5 min-w-52 rounded-lg border border-gray-200 hover:shadow-md transition-all">
            <img className="w-12" src={assets.patients_icon} alt="Patients" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.patients || 0}
              </p>
              <p className="text-gray-500">Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className="bg-white border rounded text-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
          <img className="w-5" src={assets.list_icon} alt="List" />
          <p className="font-medium text-gray-700">Latest Bookings</p>
        </div>
        
        <div className="divide-y">
          {dashData.latestAppointment && dashData.latestAppointment.length > 0 ? (
            dashData.latestAppointment.map((item, index) => (
              <div 
                className="flex items-center px-6 py-4 gap-4 hover:bg-gray-50 transition-colors" 
                key={item._id || index}
              >
                <img 
                  className="rounded-full w-12 h-12 object-cover border" 
                  src={item.docData?.image || assets.default_avatar} 
                  alt={item.docData?.name || "Doctor"}
                  onError={(e) => {
                    e.target.src = assets.default_avatar;
                  }}
                />
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    {item.docData?.name || "N/A"}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <p>Patient: {item.userData?.name || "N/A"}</p>
                    <p>Date: {item.slotDate || "N/A"}</p>
                    <p>Time: {item.slotTime || "N/A"}</p>
                  </div>
                </div>
                <div className="flex justify-center min-w-20">
                  {item.cancelled ? (
                    <p className="text-red-500 text-sm font-medium px-3 py-1 bg-red-50 rounded-full">
                      Cancelled
                    </p>
                  ) : item.isCompleted ? (
                    <p className="text-green-500 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                      Completed
                    </p>
                  ) : (
                    <button
                      onClick={() => handleCancelAppointment(item._id)}
                      className="cursor-pointer hover:opacity-70 transition-opacity p-2"
                      title="Cancel Appointment"
                    >
                      <img
                        className="w-6 h-6"
                        src={assets.about_image?.cancel_icon || assets.cancel_icon}
                        alt="Cancel"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>No recent appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;