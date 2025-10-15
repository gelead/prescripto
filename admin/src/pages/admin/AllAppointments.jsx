import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "./../../context/AppContext";
import { assets } from "./../../assets/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    getAllAppointments();
  }, [aToken]);

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    const result = await cancelAppointment(appointmentId);
    if (result) {
      console.log("Appointment cancelled successfully");
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {/* Appointments List */}
        {appointments && appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
              key={item._id || index}
            >
              {/* Serial Number */}
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient Info */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={item.userData?.image || assets.default_avatar}
                  alt={item.userData?.name || "Patient"}
                  onError={(e) => {
                    e.target.src = assets.default_avatar;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {item.userData?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-400 max-sm:hidden">
                    {item.userData?.email || ""}
                  </p>
                </div>
              </div>

              {/* Age */}
              <p className="max-sm:hidden">
                {item.userData?.dateOfBirth
                  ? calculateAge(item.userData.dateOfBirth)
                  : "N/A"}
              </p>

              {/* Date & Time */}
              <div>
                <p className="font-medium text-gray-800">
                  {item.slotDate || "N/A"}
                </p>
                <p className="text-xs text-gray-400">
                  {item.slotTime || "N/A"}
                </p>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  src={item.docData?.image || assets.default_avatar}
                  alt={item.docData?.name || "Doctor"}
                  onError={(e) => {
                    e.target.src = assets.default_avatar;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {item.docData?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-400 max-sm:hidden">
                    {item.docData?.specialization || ""}
                  </p>
                </div>
              </div>

              {/* Fees */}
              <p className="font-medium text-gray-800">
                {currency}
                {item.amount || "0"}
              </p>

              <div className="flex justify-center">
                {item.cancelled ? (
                  <p className="text-red-400 text-sm font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-400 text-sm font-medium">Completed</p>
                ) : (
                  <button
                    onClick={() => handleCancelAppointment(item._id)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    title="Cancel Appointment"
                  >
                    <img
                      className="w-8 h-8"
                      src={assets.about_image?.cancel_icon || assets.cancel_icon}
                      alt="Cancel"
                    />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;