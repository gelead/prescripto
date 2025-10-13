import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Camera, Mail, Phone, MapPin, User, Calendar } from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle field changes
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

  // ✅ Handle image selection
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

  // ✅ Save changes (send to backend)
  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("gender", userData.gender);
      formData.append("dateOfBirth", userData.dateOfBirth);
      formData.append("address", JSON.stringify(userData.address));

      // Only append if image changed (base64 → file)
      const fileInput = document.getElementById("imageUpload");
      if (fileInput && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setUserData(data.user);
        setIsEdit(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.success(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("❌ Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Component UI
  return (
    userData && (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-primary py-3 p-6 text-white text-center">
              <h1 className="text-xl font-bold">Profile Information</h1>
              <p className="text-blue-100 mt-1 text-sm">
                {isEdit
                  ? "Edit your personal details"
                  : "View your personal details"}
              </p>
            </div>

            <div className="p-3">
              {/* Profile Picture */}
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

                <div className="mt-4 w-full text-center">
                  {isEdit ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => handleChange(e, "name")}
                      className="text-xl font-semibold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center w-full"
                    />
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-800">
                      {userData.name}
                    </h2>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center gap-2">
                  <User size={18} />
                  Contact Information
                </h3>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={18} className="text-gray-500" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">Email</span>
                    <span className="text-gray-800 block">
                      {userData.email}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-gray-500" />
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
                      <span className="text-gray-800 block">
                        {userData.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-gray-500 mt-1" />
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

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Calendar size={18} />
                  Basic Information
                </h3>

                {/* Gender */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-500" />
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
                        <option value="Not Selected">Not Selected</option>
                      </select>
                    ) : (
                      <span className="text-gray-800 block">
                        {userData.gender}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-gray-500" />
                  <div className="flex-1">
                    <span className="text-gray-600 text-sm block">
                      Date of Birth
                    </span>
                    {isEdit ? (
                      <input
                        type="date"
                        value={userData.dateOfBirth}
                        onChange={(e) => handleChange(e, "dateOfBirth")}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    ) : (
                      <span className="text-gray-800 block">
                        {userData.dateOfBirth}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                {isEdit ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 py-3 px-4 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEdit(false)}
                      className="py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEdit(true)}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default MyProfile;
