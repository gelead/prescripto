import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "./../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from '../../assets/assets';

const DoctorAppointment = () => {
  const { 
    dToken, 
    appointments, 
    getAppointments, 
    completeAppointment, 
    cancelAppointment 
  } = useContext(DoctorContext);
  const { calculateAge, currency } = useContext(AppContext);
  const [loadingId, setLoadingId] = useState(null);
  
  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const handleCompleteAppointment = async (appointmentId) => {
    setLoadingId(appointmentId);
    try {
      await completeAppointment(appointmentId);
      // The context will handle the state update and toast notification
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
      // The context will handle the state update and toast notification
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter out cancelled and completed appointments if needed
  const activeAppointments = appointments.filter(appointment => 
    !appointment.cancelled && !appointment.isCompleted
  );

  const allAppointments = appointments; // or use activeAppointments if you want to filter

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_3fr_2fr_3fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        
        {allAppointments.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            {allAppointments.map((item, index) => (
              <div 
                className="max-sm:hidden grid grid-cols-[0.5fr_3fr_2fr_3fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b items-center"
                key={item._id || index}
              >
                <p>{index + 1}</p>
                <div className="flex items-center gap-2">
                  <img 
                    src={item.userData?.image || assets.default_avatar}
                    alt={item.userData?.name || 'Patient'} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="truncate font-medium">{item.userData?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{item.userData?.email || ''}</p>
                  </div>
                </div>
                <div>
                  <p className={`px-2 py-1 w-15 text-center rounded text-xs ${item.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.payment ? "Online" : "CASH"}
                  </p>
                </div>
                <p>
                  {item.userData?.dateOfBirth
                    ? calculateAge(item.userData.dateOfBirth)
                    : "N/A"}
                </p>
                <p>{item.slotDate}, {item.slotTime}</p>
                <p>{currency}{item.amount || 0}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCancelAppointment(item._id)}
                    disabled={loadingId === item._id || item.cancelled || item.isCompleted}
                    className={`p-1 rounded transition-colors ${
                      loadingId === item._id || item.cancelled || item.isCompleted
                        ? 'bg-gray-100 cursor-not-allowed opacity-50'
                        : 'hover:bg-red-50 hover:border-red-200 border border-transparent'
                    }`}
                    title={item.cancelled ? "Already Cancelled" : item.isCompleted ? "Already Completed" : "Cancel Appointment"}
                  >
                    <img 
                      src={assets.cancel_icon} 
                      alt="Cancel" 
                      className="w-5 h-5" 
                    />
                  </button>
                  <button 
                    onClick={() => handleCompleteAppointment(item._id)}
                    disabled={loadingId === item._id || item.cancelled || item.isCompleted}
                    className={`p-1 rounded transition-colors ${
                      loadingId === item._id || item.cancelled || item.isCompleted
                        ? 'bg-gray-100 cursor-not-allowed opacity-50'
                        : 'hover:bg-green-50 hover:border-green-200 border border-transparent'
                    }`}
                    title={item.cancelled ? "Cancelled" : item.isCompleted ? "Already Completed" : "Mark as Completed"}
                  >
                    <img 
                      src={assets.tick_icon} 
                      alt="Complete" 
                      className="w-5 h-5" 
                    />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Mobile View */}
            {allAppointments.map((item, index) => (
              <div 
                className="sm:hidden flex flex-col gap-3 p-4 border-b"
                key={`mobile-${item._id || index}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.userData?.image || assets.default_avatar}
                      alt={item.userData?.name || 'Patient'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.userData?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        Age: {item.userData?.dateOfBirth ? calculateAge(item.userData.dateOfBirth) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${item.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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

                {/* Status indicators for mobile */}
                {(item.cancelled || item.isCompleted) && (
                  <div className="flex gap-2">
                    {item.cancelled && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        Cancelled
                      </span>
                    )}
                    {item.isCompleted && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Completed
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleCancelAppointment(item._id)}
                    disabled={loadingId === item._id || item.cancelled || item.isCompleted}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      loadingId === item._id || item.cancelled || item.isCompleted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {loadingId === item._id ? 'Processing...' : 'Cancel'}
                  </button>
                  <button 
                    onClick={() => handleCompleteAppointment(item._id)}
                    disabled={loadingId === item._id || item.cancelled || item.isCompleted}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      loadingId === item._id || item.cancelled || item.isCompleted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {loadingId === item._id ? 'Processing...' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointment;