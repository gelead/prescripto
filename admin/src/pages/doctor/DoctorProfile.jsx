import React, { useContext, useState, useEffect, useCallback } from "react";
import { Camera, Mail, Phone, MapPin, User, Calendar, GraduationCap, Stethoscope, DollarSign, Clock, BookOpen } from "lucide-react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "./../../context/AppContext";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { 
    dToken, 
    profileData, 
    getProfileData, 
    updateProfile 
  } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  // Initialize editData with existing schema
  const handleEdit = () => {
    setEditData({
      ...profileData,
    });
    setIsEdit(true);
    setFormErrors({});
  };

  // Cancel edits and restore original data
  const handleCancel = () => {
    setEditData(null);
    setIsEdit(false);
    setFormErrors({});
  };

  // Handle field changes - works with existing schema
  const handleChange = useCallback((e, field) => {
    const value = e.target.value;
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  // Handle address field changes
  const handleAddressChange = useCallback((e, field) => {
    const value = e.target.value;
    setEditData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    if (formErrors.address) {
      setFormErrors(prev => ({ ...prev, address: '' }));
    }
  }, [formErrors]);

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle availability - uses existing available field
  const handleAvailabilityToggle = () => {
    setEditData(prev => ({
      ...prev,
      available: !prev.available
    }));
  };

  // Form validation for existing fields
  const validateForm = () => {
    const errors = {};
    
    if (!editData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!editData.education?.trim()) {
      errors.education = 'Education information is required';
    }
    
    if (!editData.speciality?.trim()) {
      errors.speciality = 'Speciality is required';
    }
    
    if (!editData.experience?.trim()) {
      errors.experience = 'Experience is required';
    }
    
    if (!editData.about?.trim()) {
      errors.about = 'About section is required';
    }
    
    if (!editData.fees || editData.fees <= 0) {
      errors.fees = 'Valid appointment fee is required';
    }

    return errors;
  };

  // Save changes using context updateProfile function
  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all existing fields without modification
      formData.append("name", editData.name.trim());
      formData.append("education", editData.education.trim());
      formData.append("speciality", editData.speciality.trim());
      formData.append("experience", editData.experience.trim());
      formData.append("about", editData.about.trim());
      formData.append("fees", editData.fees);
      formData.append("available", editData.available);
      
      // Append phone if exists
      if (editData.phone) {
        formData.append("phone", editData.phone);
      }
      
      // Append address fields if they exist
      if (editData.address) {
        formData.append("address", JSON.stringify(editData.address));
      }

      // Handle image upload
      const fileInput = document.getElementById("imageUpload");
      if (fileInput && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
      }

      // Use the updateProfile function from context
      const result = await updateProfile(formData);
      
      if (result.success) {
        setIsEdit(false);
        setEditData(null);
        setFormErrors({});
        // No need to call getProfileData() as context already updates the state
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const displayedData = isEdit ? editData : profileData;
  const isFormDisabled = loading;

  // Loading state
  if (!displayedData) {
    return (
      <div className="w-full max-w-6xl m-5">
        <p className="mb-3 text-lg font-medium">Doctor Profile</p>
        <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto flex items-center justify-center">
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Doctor Profile</p>
      
      <div className="bg-white border rounded text-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
          <User className="w-5" />
          <p className="font-medium text-gray-700">
            {isEdit ? "Edit Profile Information" : "Profile Information"}
          </p>
        </div>

        <div className="p-6">
          {/* Profile Header with Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <img
                src={displayedData.image || "/default-avatar.png"}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
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
                    disabled={isFormDisabled}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="mt-4 w-full text-center">
              {isEdit ? (
                <div>
                  <input
                    type="text"
                    value={displayedData.name || ''}
                    onChange={(e) => handleChange(e, "name")}
                    disabled={isFormDisabled}
                    className="text-xl font-semibold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center w-full disabled:opacity-50"
                    placeholder="Enter your name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
              ) : (
                <h2 className="text-xl font-semibold text-gray-800">
                  {displayedData.name}
                </h2>
              )}
            </div>
          </div>

          {/* Professional Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Professional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center gap-2">
                <User size={18} />
                Professional Information
              </h3>

              {/* Education */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <GraduationCap size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Education</label>
                  {isEdit ? (
                    <div>
                      <input
                        type="text"
                        value={displayedData.education || ''}
                        onChange={(e) => handleChange(e, "education")}
                        disabled={isFormDisabled}
                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        placeholder="MBBS, MD, etc."
                      />
                      {formErrors.education && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.education}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">{displayedData.education}</span>
                  )}
                </div>
              </div>

              {/* Speciality */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Stethoscope size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Speciality</label>
                  {isEdit ? (
                    <div>
                      <input
                        type="text"
                        value={displayedData.speciality || ''}
                        onChange={(e) => handleChange(e, "speciality")}
                        disabled={isFormDisabled}
                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        placeholder="Cardiology, Dermatology, etc."
                      />
                      {formErrors.speciality && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.speciality}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">{displayedData.speciality}</span>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Experience</label>
                  {isEdit ? (
                    <div>
                      <input
                        type="text"
                        value={displayedData.experience || ''}
                        onChange={(e) => handleChange(e, "experience")}
                        disabled={isFormDisabled}
                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        placeholder="5 years"
                      />
                      {formErrors.experience && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.experience}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">{displayedData.experience}</span>
                  )}
                </div>
              </div>

              {/* Appointment Fee */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Appointment Fee</label>
                  {isEdit ? (
                    <div>
                      <input
                        type="number"
                        value={displayedData.fees || ''}
                        onChange={(e) => handleChange(e, "fees")}
                        disabled={isFormDisabled}
                        className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        placeholder="500"
                        min="0"
                      />
                      {formErrors.fees && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.fees}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">
                      {currency} {displayedData.fees}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Availability */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-base border-b border-gray-200 pb-2 flex items-center gap-2">
                <Phone size={18} />
                Contact & Availability
              </h3>

              {/* Phone */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Phone</label>
                  {isEdit ? (
                    <input
                      type="tel"
                      value={displayedData.phone || ''}
                      onChange={(e) => handleChange(e, "phone")}
                      disabled={isFormDisabled}
                      className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <span className="text-gray-800 block">
                      {displayedData.phone || 'Not provided'}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              {displayedData.address && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-gray-500 mt-1" />
                  <div className="flex-1">
                    <label className="text-gray-600 text-sm block mb-1">Address</label>
                    {isEdit ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={displayedData.address.line1 || ''}
                          onChange={(e) => handleAddressChange(e, "line1")}
                          disabled={isFormDisabled}
                          placeholder="Street address"
                          className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        />
                        <input
                          type="text"
                          value={displayedData.address.line2 || ''}
                          onChange={(e) => handleAddressChange(e, "line2")}
                          disabled={isFormDisabled}
                          placeholder="City, State, ZIP"
                          className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-800">
                        <div>{displayedData.address.line1}</div>
                        {displayedData.address.line2 && (
                          <div>{displayedData.address.line2}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={18} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <label className="text-gray-600 text-sm block mb-1">Availability</label>
                  {isEdit ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="available"
                        checked={displayedData.available || false}
                        onChange={handleAvailabilityToggle}
                        disabled={isFormDisabled}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="available" className="text-gray-800">
                        Available for appointments
                      </label>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${displayedData.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {displayedData.available ? 'Available' : 'Not Available'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section - Full Width */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
              <BookOpen size={18} />
              About
            </h3>

            <div className="p-4 bg-gray-50 rounded-lg">
              {isEdit ? (
                <div>
                  <textarea
                    value={displayedData.about || ''}
                    onChange={(e) => handleChange(e, "about")}
                    disabled={isFormDisabled}
                    rows="4"
                    className="w-full border border-gray-300 bg-white rounded-lg p-3 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50 resize-vertical"
                    placeholder="Describe your expertise, approach to patient care, and any other relevant information..."
                  />
                  {formErrors.about && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.about}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{displayedData.about}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isEdit ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isFormDisabled}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isFormDisabled}
                  className="py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;