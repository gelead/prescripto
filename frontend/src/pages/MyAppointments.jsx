import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch all user appointments
  const getUserAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAppointments([...data.appointments].reverse());
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      setCancellingId(appointmentId);
      const { data } = await axios.delete(
        `${backendUrl}/api/user/cancel-appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Appointment cancelled successfully");
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? { ...apt, cancelled: true, status: "cancelled" }
              : apt
          )
        );
        getDoctorsData();
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel appointment";
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  // Format readable date and time
  const formatSlot = (slotDate, slotTime) => {
    if (!slotDate || !slotTime) return "Date not specified";

    try {
      const [day, month, year] = slotDate.split("_").map(Number);
      const formattedDate = new Date(year, month - 1, day);

      return (
        formattedDate.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }) + ` at ${slotTime}`
      );
    } catch {
      return `${slotDate} at ${slotTime}`;
    }
  };

  // Get status styles
  const getStatusStyles = (appointment) => {
    if (appointment.cancelled || appointment.status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    } else if (appointment.isCompleted || appointment.status === "completed") {
      return "bg-green-50 text-green-700 border-green-200";
    } else {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Get status text
  const getStatusText = (appointment) => {
    if (appointment.cancelled || appointment.status === "cancelled") {
      return "Cancelled";
    } else if (appointment.isCompleted || appointment.status === "completed") {
      return "Completed";
    } else {
      return "Confirmed";
    }
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My Appointments
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and view your upcoming appointments
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't booked any appointments yet.
            </p>
            <button
              onClick={() => (window.location.href = "/doctors")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((item) => {
            const isCancelled = item.cancelled || item.status === "cancelled";
            const isCompleted = item.isCompleted || item.status === "completed";

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Doctor Image */}
                    <div className="flex-shrink-0">
                      <img
                        className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg bg-gray-100 border border-gray-200"
                        src={item.docData?.image || "/default-doctor.png"}
                        alt={item.docData?.name || "Doctor"}
                        onError={(e) => (e.target.src = "/default-doctor.png")}
                      />
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.docData?.name || "Doctor Name"}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {item.docData?.speciality ||
                              "Speciality not provided"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-500">
                              Amount
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${item.amount}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles(
                              item
                            )}`}
                          >
                            {getStatusText(item)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date & Time
                          </p>
                          <p className="text-gray-900 font-medium">
                            {formatSlot(item.slotDate, item.slotTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 min-w-[200px] w-full lg:w-auto">
                      <button
                        className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                          item.payment || isCancelled || isCompleted
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary-dark shadow-sm"
                        }`}
                        disabled={item.payment || isCancelled || isCompleted}
                      >
                        {item.payment ? "Paid" : "Pay Online"}
                      </button>

                      <button
                        onClick={() => cancelAppointment(item._id)}
                        disabled={
                          cancellingId === item._id ||
                          isCancelled ||
                          isCompleted
                        }
                        className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${
                          cancellingId === item._id ||
                          isCancelled ||
                          isCompleted
                            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "text-red-700 bg-white border-red-300 hover:bg-red-50 hover:border-red-400"
                        }`}
                      >
                        {cancellingId === item._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            Cancelling...
                          </>
                        ) : isCancelled ? (
                          "Cancelled"
                        ) : isCompleted ? (
                          "Completed"
                        ) : (
                          "Cancel Appointment"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
