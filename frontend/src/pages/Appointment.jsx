import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const getAvailableSlots = async () => {
    setDocSlot([]);
    let today = new Date();

    let allSlots = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let startTime = new Date(currentDate);
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0); // 9 PM of the same day

      // If today, start from next available half-hour slot
      if (i === 0) {
        // Ensure we don't start before 10:00 AM
        if (startTime.getHours() < 10) {
          startTime.setHours(10, 0, 0, 0);
        } else {
          // Round up to the next 30-minute slot, but keep :00 if exactly on the hour
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
        startTime.setHours(10, 0, 0, 0); // Start at 10:00 AM
      }

      let timeSlots = [];
      let tempTime = new Date(startTime);

      while (tempTime < endTime) {
        let formattedTime = tempTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        timeSlots.push({
          datetime: new Date(tempTime), // actual slot time
          time: formattedTime,
        });
        tempTime.setMinutes(tempTime.getMinutes() + 30);
      }

      allSlots.push({
        date: currentDate.toDateString(),
        slots: timeSlots,
      });
    }

    setDocSlot(allSlots);
  };

  useEffect(() => {
    console.log("Available slots:", docSlot);
  }, [docSlot]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  const fetchDocInfo = async () => {
    const doctor = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctor);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  return (
    docInfo && (
      <div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt={`${docInfo.name} image`}
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-900">
              {docInfo.name}
              <img
                className="w-5"
                src={assets.verified_icon}
                alt="verified icon"
              />
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border border-gray-200 text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About{" "}
                <img className="w-3" src={assets.info_icon} alt="info icon" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4 ">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlot.length > 0 &&
              docSlot.map((item, index) => (
                <div key={index} className="mb-4">
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                      slotIndex === index
                        ? "bg-primary text-white"
                        : "border border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">
                      {daysOfWeek[new Date(item.date).getDay()]}
                    </p>
                    <p>{new Date(item.date).getDate()}</p>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4">
            {docSlot.length > 0 && docSlot[slotIndex] && (
              <div className="flex gap-3 w-full overflow-x-scroll">
                {docSlot[slotIndex].slots.map((slot, index) => (
                  <button
                    key={index}
                    className={`text-sm font-light px-5 py-2 rounded-full cursor-pointer border border-gray-400 whitespace-nowrap flex-shrink-0 ${
                      slotTime === slot.time
                        ? "bg-primary text-white"
                        : "text-gray-400 border-gray-300"
                    }`}
                    onClick={() => setSlotTime(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-primary text-white cursor-pointer text-sm font-light px-14 py-3 rounded-full my-6">
            Book an appointment
          </button>
        </div>
        <RelatedDoctors docInfo={docInfo} />
      </div>
    )
  );
};

export default Appointment;
