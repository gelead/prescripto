import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({docInfo}) => {
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const speciality = docInfo.speciality
  const navigate = useNavigate();
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality && doc._id !== docInfo._id));
    } else {
      setFilterDoc(doctors);
    }
  };
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, docInfo]);
  return (
    <div className="w-full grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4 gap-y-6">
      {filterDoc.map((item) => (
        <div
          onClick={() => {navigate(`/appointment/${item._id}`), scrollTo(0, 0)}}
          className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
          key={item._id}
        >
          <img
            className="bg-blue-50"
            src={item.image}
            alt={`${item.name} image`}
          />
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-center text-green-500">
              <p className="w-2 h-2 bg-green-500 rounded-full "></p>
              <p>Available</p>
            </div>
            <p className="text-gray-900 text-lg font-medium">{item.name}</p>
            <p className="text-gray-600 text-sm">{item.speciality}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedDoctors;
