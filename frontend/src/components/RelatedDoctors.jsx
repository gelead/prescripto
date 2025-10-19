import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ docInfo }) => {
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const speciality = docInfo.speciality;
  const navigate = useNavigate();
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(
        doctors.filter(
          (doc) => doc.speciality === speciality && doc._id !== docInfo._id
        )
      );
    } else {
      setFilterDoc(doctors);
    }
  };
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, docInfo]);
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Related Doctors</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4 gap-y-6 my-5 px-3">
        {filterDoc.map((item) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`), scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            key={item._id}
          >
            <img
              className="bg-indigo-50"
              src={item.image}
              alt={`${item.name} image`}
            />
            <div className="p-4">
              <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'} `}>
                <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'}  rounded-full `}></p>
                <p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>
              <p className="text-gray-900 text-lg font-medium">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedDoctors;
