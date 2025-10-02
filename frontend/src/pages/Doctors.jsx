import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);
  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5 ">
        <button
          onClick={() => {setShowFilter(!showFilter), navigate('/doctors')}}
          className={`${
            showFilter ? "bg-primary text-white" : "border border-gray-200"
          } border border-gray-200 px-3 py-1 text-sm rounded cursor-pointer sm:hidden transition-all gap-2 duration-100`}
        >
          Filters
        </button>
        {showFilter && (
          <div className="flex flex-col gap-4 text-sm text-gray-600">
            <NavLink
              to="/doctors/General physician"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              General physician
            </NavLink>

            <NavLink
              to="/doctors/Gynecologist"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              Gynecologist
            </NavLink>

            <NavLink
              to="/doctors/Dermatologist"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              Dermatologist
            </NavLink>

            <NavLink
              to="/doctors/Pediatricians"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              Pediatricians
            </NavLink>

            <NavLink
              to="/doctors/Neurologist"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              Neurologist
            </NavLink>

            <NavLink
              to="/doctors/Gastroenterologist"
              className={({ isActive }) =>
                `w-[94vh] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
    ${isActive ? "bg-indigo-100 text-black" : "hover:bg-gray-100"}`
              }
            >
              Gastroenterologist
            </NavLink>
          </div>
        )}

        <div className="w-full grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-4 gap-y-6">
          {filterDoc.map((item) => (
            <div
              onClick={() => navigate(`/appointment/${item._id}`)}
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
      </div>
    </div>
  );
};

export default Doctors;
