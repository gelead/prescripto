import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Camera, Mail, Phone, MapPin, User, Calendar } from "lucide-react";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    image: assets.profile_pic,
    email: "richardjameswilliams@gmail.com",
    phone: "+1234567890",
    address: { line1: "123 Main St", line2: "Anytown, USA" },
    gender: "Male",
    dateOfBirth: "1990-01-01",
  });

  const [isEdit, setIsEdit] = useState(false);

  // Handle text fields
  const handleChange = (e, field, nestedField = null) => {
    if (nestedField) {
      setUserData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [nestedField]: e.target.value },
      }));
    } else {
      setUserData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Profile Information</h1>
            <p className="text-blue-100 mt-1">
              {isEdit ? "Edit your personal details" : "View your personal details"}
            </p>
          </div>

          <div className="p-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <img
                  src={userData.image}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEdit && (
                  <label
                    htmlFor="imageUpload"
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      id="imageUpload"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mt-4">
                {userData.name}
              </h2>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-700 text-lg border-b border-gray-200 pb-2 flex items-center gap-2">
                <User size={18} />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Email</span>
                    {isEdit ? (
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleChange(e, "email")}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    ) : (
                      <span className="text-gray-800 block">{userData.email}</span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Phone</span>
                    {isEdit ? (
                      <input
                        type="text"
                        value={userData.phone}
                        onChange={(e) => handleChange(e, "phone")}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    ) : (
                      <span className="text-gray-800 block">{userData.phone}</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-gray-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Address</span>
                    {isEdit ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={userData.address.line1}
                          onChange={(e) => handleChange(e, "address", "line1")}
                          placeholder="Street address"
                          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                        />
                        <input
                          type="text"
                          value={userData.address.line2}
                          onChange={(e) => handleChange(e, "address", "line2")}
                          placeholder="City, State, ZIP"
                          className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-800">
                        <div>{userData.address.line1}</div>
                        <div>{userData.address.line2}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-lg border-b border-gray-200 pb-2 flex items-center gap-2">
                <Calendar size={18} />
                Basic Information
              </h3>
              
              <div className="space-y-3">
                {/* Gender */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Gender</span>
                    {isEdit ? (
                      <select
                        value={userData.gender}
                        onChange={(e) => handleChange(e, "gender")}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    ) : (
                      <span className="text-gray-800 block">{userData.gender}</span>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Date of Birth</span>
                    {isEdit ? (
                      <input
                        type="date"
                        value={userData.dateOfBirth}
                        onChange={(e) => handleChange(e, "dateOfBirth")}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    ) : (
                      <span className="text-gray-800 block">{userData.dateOfBirth}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsEdit((prev) => !prev)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isEdit
                    ? "bg-primary hover:bg-blue-500 text-white shadow-md"
                    : "bg-primary hover:bg-blue-500 text-white shadow-md"
                }`}
              >
                {isEdit ? "Save Changes" : "Edit Profile"}
              </button>
              
              {isEdit && (
                <button
                  onClick={() => setIsEdit(false)}
                  className="py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;