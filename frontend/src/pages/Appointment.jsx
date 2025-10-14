import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData, userData } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const navigate = useNavigate();

  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // Get available slots for the next 7 days
  const getAvailableSlots = () => {
    if (!docInfo) return;
    
    setLoading(true);
    try {
      let today = new Date();
      let allSlots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let startTime = new Date(currentDate);
        let endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0);

        if (i === 0) {
          if (startTime.getHours() < 10) {
            startTime.setHours(10, 0, 0, 0);
          } else {
            const currentMinutes = startTime.getMinutes();
            if (currentMinutes === 0) {
              startTime.setMinutes(0);
            } else if (currentMinutes <= 30) {
              startTime.setMinutes(30);
            } else {
              startTime.setHours(startTime.getHours() + 1);
              startTime.setMinutes(0);
            }
          }
        } else {
          startTime.setHours(10, 0, 0, 0);
        }

        let timeSlots = [];
        let tempTime = new Date(startTime);

        while (tempTime < endTime) {
          let formattedTime = tempTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });
          
          const slotDateKey = formatDateForBackend(tempTime);
          const isBooked = docInfo.slots_booked && 
                          docInfo.slots_booked[slotDateKey] && 
                          docInfo.slots_booked[slotDateKey].includes(formattedTime);
          
          timeSlots.push({
            datetime: new Date(tempTime),
            time: formattedTime,
            isBooked: isBooked
          });
          tempTime.setMinutes(tempTime.getMinutes() + 30);
        }

        allSlots.push({
          date: currentDate.toDateString(),
          dateObj: new Date(currentDate),
          slots: timeSlots,
        });
      }

      setDocSlot(allSlots);
    } catch (error) {
      console.error("Error generating slots:", error);
      toast.error("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  // Format date for backend (DD_MM_YYYY)
  const formatDateForBackend = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}_${month}_${year}`;
  };

  // Check if a slot is available
  const isSlotAvailable = (slotDate, slotTime) => {
    const dateKey = formatDateForBackend(new Date(slotDate));
    return !(docInfo.slots_booked && 
             docInfo.slots_booked[dateKey] && 
             docInfo.slots_booked[dateKey].includes(slotTime));
  };

  const fetchDocInfo = async () => {
    try {
      const doctor = doctors.find((doc) => doc._id === docId);
      if (doctor) {
        setDocInfo(doctor);
      } else {
        const response = await axios.get(`${backendUrl}/api/doctor/get-doctor/${docId}`);
        if (response.data.success) {
          setDocInfo(response.data.doctor);
        } else {
          toast.error("Doctor not found");
          navigate("/doctors");
        }
      }
    } catch (error) {
      console.error("Error fetching doctor info:", error);
      toast.error("Failed to load doctor information");
      navigate("/doctors");
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Please login to book an appointment');
      return navigate('/login', { state: { returnUrl: `/appointment/${docId}` } });
    }

    if (!userData || !userData._id) {
      toast.error('User information not found. Please login again.');
      return navigate('/login');
    }

    if (!slotTime) {
      return toast.warn('Please select a time slot');
    }

    if (!docSlot[slotIndex]) {
      return toast.error('Invalid date selection');
    }

    const selectedSlot = docSlot[slotIndex];
    const slotDateKey = formatDateForBackend(selectedSlot.dateObj);

    // Double-check if slot is still available
    if (!isSlotAvailable(selectedSlot.date, slotTime)) {
      toast.error('This time slot has been booked. Please select another time.');
      await fetchDocInfo();
      return;
    }

    setBookingLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        {
          userId: userData._id,
          docId: docId,
          slotDate: slotDateKey,
          slotTime: slotTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        
        if (getDoctorsData) {
          await getDoctorsData();
        }
        
        setSlotTime("");
        
        setTimeout(() => {
          navigate('/my-appointments');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 400:
            toast.error(message || 'Slot already booked. Please choose another time.');
            await fetchDocInfo();
            break;
          case 401:
            toast.error('Authentication failed. Please login again.');
            navigate('/login');
            break;
          case 404:
            if (message.includes('User')) {
              toast.error('User account not found. Please contact support.');
            } else if (message.includes('Doctor')) {
              toast.error('Doctor not found or not available.');
            } else {
              toast.error('Resource not found.');
            }
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(message || 'Failed to book appointment.');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Auto-select first available slot when date changes
  useEffect(() => {
    if (docSlot[slotIndex] && docSlot[slotIndex].slots.length > 0) {
      const availableSlot = docSlot[slotIndex].slots.find(slot => !slot.isBooked);
      if (availableSlot) {
        setSlotTime(availableSlot.time);
      } else {
        setSlotTime("");
      }
    }
  }, [slotIndex, docSlot]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  // Format experience display - fixed to avoid repetition
  const formatExperience = (exp) => {
    if (!exp) return "0 years experience";
    
    // If experience is already a string with "years" or similar, return as is
    if (typeof exp === 'string' && (exp.includes('year') || exp.includes('Year'))) {
      return exp;
    }
    
    // Otherwise, format the number
    const years = parseInt(exp);
    if (isNaN(years)) return "0 years experience";
    
    return `${years} ${years === 1 ? "year" : "years"} experience`;
  };

  // Format doctor name - remove duplicate "Dr."
  const formatDoctorName = (name) => {
    if (!name) return "";
    // Remove "Dr." if it's already in the name to avoid duplication
    return name.replace(/^Dr\.\s*/i, '');
  };

  return (
    docInfo && (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Doctor Image */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <img
                className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg bg-primary"
                src={docInfo.image || assets.default_avatar}
                alt={`Dr. ${docInfo.name}`}
                onError={(e) => {
                  e.target.src = assets.default_avatar;
                }}
              />
              
              {/* Mobile Doctor Info */}
              <div className="lg:hidden mt-6 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  Dr. {formatDoctorName(docInfo.name)}
                  <img
                    className="w-5 h-5"
                    src={assets.verified_icon}
                    alt="verified"
                  />
                </h1>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <p className="text-sm">
                    {docInfo.degree} - {docInfo.specialization || docInfo.speciality}
                  </p>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {formatExperience(docInfo.experience)}
                  </span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Appointment Fee:
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {currencySymbol}
                    {docInfo.fees || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Details and Booking */}
          <div className="lg:w-2/3">
            {/* Desktop Doctor Info */}
            <div className="hidden lg:block border border-gray-200 rounded-2xl p-8 bg-white shadow-sm">
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                Dr. {formatDoctorName(docInfo.name)}
                <img
                  className="w-6 h-6"
                  src={assets.verified_icon}
                  alt="verified"
                />
              </h1>
              <div className="flex items-center gap-3 mt-3 text-gray-600">
                <p className="text-lg">
                  {docInfo.degree} - {docInfo.specialization || docInfo.speciality}
                </p>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                  {formatExperience(docInfo.experience)}
                </span>
              </div>
              
              <div className="mt-6">
                <p className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  About
                  <img className="w-4" src={assets.info_icon} alt="info" />
                </p>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  {docInfo.about || "No description available."}
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Appointment Fee:
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {currencySymbol}
                  {docInfo.fees || "Not specified"}
                </p>
              </div>
            </div>

            {/* Booking Section */}
            <div className="mt-8 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Book Your Appointment
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-4">Select Date</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {docSlot.length > 0 ? (
                    docSlot.map((item, index) => (
                      <div key={index} className="flex-shrink-0">
                        <button
                          onClick={() => setSlotIndex(index)}
                          className={`text-center py-4 px-5 min-w-20 rounded-xl cursor-pointer transition-all ${
                            slotIndex === index
                              ? "bg-primary text-white shadow-lg transform scale-105"
                              : "border border-gray-300 hover:border-primary hover:bg-blue-50"
                          }`}
                        >
                          <p className="font-semibold text-sm">
                            {daysOfWeek[new Date(item.date).getDay()]}
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {new Date(item.date).getDate()}
                          </p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                        <div key={item} className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-4">
                  Available Time Slots
                  {docSlot[slotIndex] && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({new Date(docSlot[slotIndex].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })})
                    </span>
                  )}
                </p>
                
                {loading ? (
                  <div className="flex gap-3 flex-wrap">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="w-20 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                ) : docSlot[slotIndex] && docSlot[slotIndex].slots.length > 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    {docSlot[slotIndex].slots.map((slot, index) => (
                      <button
                        key={index}
                        disabled={slot.isBooked}
                        onClick={() => !slot.isBooked && setSlotTime(slot.time)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          slotTime === slot.time
                            ? "bg-primary text-white shadow-lg transform scale-105"
                            : slot.isBooked
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                            : "border border-gray-300 text-gray-700 hover:border-primary hover:bg-blue-50"
                        }`}
                      >
                        {slot.time}
                        {slot.isBooked && (
                          <span className="text-xs block text-gray-500">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>

              {/* Selected Slot Info */}
              {slotTime && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Selected Appointment:
                  </p>
                  <p className="text-green-700">
                    {new Date(docSlot[slotIndex].date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {slotTime}
                  </p>
                  <p className="text-green-700 font-semibold mt-1">
                    Fee: {currencySymbol}
                    {docInfo.fees}
                  </p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={bookAppointment}
                disabled={!slotTime || bookingLoading || !userData}
                className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {bookingLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Booking Appointment...
                  </>
                ) : (
                  `Book Appointment - ${currencySymbol}${docInfo.fees}`
                )}
              </button>

              {/* Login Prompt */}
              {!token && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm text-center">
                    Please login to book an appointment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Doctors */}
        <div className="mt-12">
          <RelatedDoctors docInfo={docInfo} />
        </div>
      </div>
    )
  );
};

export default Appointment;