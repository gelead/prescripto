import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "./../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointment = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge, currency } = useContext(AppContext);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  const handleCompleteAppointment = async (appointmentId) => {
    setLoadingId(appointmentId);
    try {
      await completeAppointment(appointmentId);
    } catch (error) {
      console.error("Error completing appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setLoadingId(appointmentId);
    try {
      await cancelAppointment(appointmentId);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[60px_2fr_1fr_1fr_2fr_1fr_1.5fr] py-3 px-6 border-b bg-gray-50 font-medium text-gray-700">
          <p className="text-center">#</p>
          <p>Patient</p>
          <p className="text-center">Payment</p>
          <p className="text-center">Age</p>
          <p className="text-center">Date & Time</p>
          <p className="text-center">Fees</p>
          <p className="text-center">Action</p>
        </div>

        {/* Empty state */}
        {appointments.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            {appointments.map((item, index) => (
              <div
                key={item._id || index}
                className="hidden sm:grid grid-cols-[60px_2fr_1fr_1fr_2fr_1fr_1.5fr] items-center py-3 px-6 border-b hover:bg-gray-50 transition"
              >
                <p className="text-center font-medium">{index + 1}</p>

                <div className="flex items-center gap-3">
                  <img
                    src={item.userData?.image || assets.default_avatar}
                    alt={item.userData?.name || "Patient"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.userData?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 truncate">{item.userData?.email || ""}</p>
                  </div>
                </div>

                <p
                  className={`text-center px-2 py-1 rounded text-xs font-medium ${
                    item.payment
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.payment ? "Online" : "CASH"}
                </p>

                <p className="text-center">
                  {item.userData?.dateOfBirth
                    ? calculateAge(item.userData.dateOfBirth)
                    : "N/A"}
                </p>

                <p className="text-center">{item.slotDate}, {item.slotTime}</p>
                <p className="text-center">{currency}{item.amount || 0}</p>

                {/* Actions */}
                <div className="flex justify-center gap-2">
                  {item.cancelled ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Completed
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCancelAppointment(item._id)}
                        disabled={loadingId === item._id}
                        className={`p-1 rounded border transition ${
                          loadingId === item._id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-red-50 hover:border-red-200"
                        }`}
                      >
                        <img
                          src={assets.cancel_icon}
                          alt="Cancel"
                          className="w-5 h-5"
                        />
                      </button>

                      <button
                        onClick={() => handleCompleteAppointment(item._id)}
                        disabled={loadingId === item._id}
                        className={`p-1 rounded border transition ${
                          loadingId === item._id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-50 hover:border-green-200"
                        }`}
                      >
                        <img
                          src={assets.tick_icon}
                          alt="Complete"
                          className="w-5 h-5"
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Mobile View */}
            {appointments.map((item, index) => (
              <div
                key={`mobile-${item._id || index}`}
                className="sm:hidden flex flex-col gap-3 p-4 border-b"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userData?.image || assets.default_avatar}
                      alt={item.userData?.name || "Patient"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.userData?.name || "Unknown"}</p>
                      <p className="text-sm text-gray-600">
                        Age: {item.userData?.dateOfBirth ? calculateAge(item.userData.dateOfBirth) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.payment ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.payment ? "Online" : "CASH"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-600">Date & Time</p>
                    <p>{item.slotDate}, {item.slotTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fees</p>
                    <p>{currency}{item.amount || 0}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {item.cancelled ? (
                    <span className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm font-medium">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm font-medium">
                      Completed
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCancelAppointment(item._id)}
                        disabled={loadingId === item._id}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          loadingId === item._id
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        {loadingId === item._id ? "Processing..." : "Cancel"}
                      </button>
                      <button
                        onClick={() => handleCompleteAppointment(item._id)}
                        disabled={loadingId === item._id}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          loadingId === item._id
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {loadingId === item._id ? "Processing..." : "Complete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(DoctorAppointment);
