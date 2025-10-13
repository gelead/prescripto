import React, { useContext, useState, useEffect, useCallback } from "react";
import { Camera, Mail, Phone, MapPin, User, Calendar } from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Initialize editData with proper structure
  const handleEdit = () => {
    setEditData({
      ...userData,
      address: userData.address || { line1: '', line2: '' },
      phone: userData.phone || '',
      gender: userData.gender || 'Not Selected',
      dateOfBirth: userData.dateOfBirth || ''
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

  // Handle field changes on editData
  const handleChange = useCallback((e, field, nestedField = null) => {
    const value = e.target.value;
    setEditData((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [field]: { ...prev[field], [nestedField]: value },
        };
      } else {
        return { ...prev, [field]: value };
      }
    });

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  // Handle profile image change with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (5MB limit)
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

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!editData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (editData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    if (editData.phone && !/^\d{10,15}$/.test(editData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    if (editData.dateOfBirth) {
      const dob = new Date(editData.dateOfBirth);
      const today = new Date();
      
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      
      // Check if user is at least 13 years old
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
      if (dob > minAgeDate) {
        errors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    if (editData.address?.line1 && !editData.address.line1.trim()) {
      errors.address = 'Street address cannot be empty';
    }

    return errors;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Save changes to backend
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
      
      // Append all fields
      formData.append("name", editData.name.trim());
      formData.append("phone", editData.phone || '');
      formData.append("gender", editData.gender || 'Not Selected');
      formData.append("dateOfBirth", editData.dateOfBirth || '');
      formData.append("address", JSON.stringify({
        line1: editData.address?.line1 || '',
        line2: editData.address?.line2 || ''
      }));

      // Handle image upload
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
          timeout: 30000, // 30 second timeout
        }
      );

      if (data.success) {
        setUserData(data.user);
        setIsEdit(false);
        setEditData(null);
        setFormErrors({});
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please try again.");
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || "Failed to update profile.";
        toast.error(errorMessage);
        
        // Handle specific error cases
        if (error.response.status === 401) {
          toast.error("Please log in again.");
        } else if (error.response.status === 413) {
          toast.error("Image file is too large. Please choose a smaller file.");
        }
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your internet connection.");
      } else {
        // Other errors
        toast.error(error.message || "Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedData = isEdit ? editData : userData;
  const isFormDisabled = loading;

  // Loading skeleton
  if (!displayedData) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto lg:max-w-lg">
          <div className="rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-primary py-3 p-6 text-white text-center">
              <div className="h-6 bg-blue-400 rounded animate-pulse mx-auto w-48"></div>
              <div className="h-4 bg-blue-300 rounded animate-pulse mx-auto w-64 mt-2"></div>
            </div>
            
            <div className="p-6">
              {/* Profile Picture Skeleton */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded animate-pulse w-32 mt-4"></div>
              </div>

              {/* Contact Info Skeleton */}
              <div className="space-y-4 mb-6">
                <div className="h-5 bg-gray-300 rounded animate-pulse w-40"></div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-16 mb-2"></div>
                      <div className="h-5 bg-gray-300 rounded animate-pulse w-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Info Skeleton */}
              <div className="space-y-4">
                <div className="h-5 bg-gray-300 rounded animate-pulse w-40"></div>
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-16 mb-2"></div>
                      <div className="h-5 bg-gray-300 rounded animate-pulse w-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Button Skeleton */}
              <div className="mt-8">
                <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto lg:max-w-lg">
        <div className="rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-primary py-3 p-6 text-white text-center">
            <h1 className="text-xl font-bold">Profile Information</h1>
            <p className="text-blue-100 mt-1 text-sm">
              {isEdit
                ? "Edit your personal details"
                : "View your personal details"}
            </p>
          </div>

          <div className="p-6">
            {/* Profile Picture */}
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
                  <h2 className="text-lg font-semibold text-gray-800">
                    {displayedData.name || 'No name provided'}
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
                  <label htmlFor="email" className="text-gray-600 text-sm block">
                    Email
                  </label>
                  <span className="text-gray-800 block" id="email">
                    {displayedData.email}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-gray-500" />
                <div className="flex-1">
                  <label htmlFor="phone" className="text-gray-600 text-sm block">
                    Phone
                  </label>
                  {isEdit ? (
                    <div>
                      <input
                        id="phone"
                        type="tel"
                        value={displayedData.phone || ''}
                        onChange={(e) => handleChange(e, "phone")}
                        disabled={isFormDisabled}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        placeholder="Enter phone number"
                        aria-describedby={formErrors.phone ? "phone-error" : undefined}
                      />
                      {formErrors.phone && (
                        <p id="phone-error" className="text-red-500 text-xs mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">
                      {displayedData.phone || 'Not provided'}
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
                        value={displayedData.address?.line1 || ''}
                        onChange={(e) => handleChange(e, "address", "line1")}
                        disabled={isFormDisabled}
                        placeholder="Street address"
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                      />
                      <input
                        type="text"
                        value={displayedData.address?.line2 || ''}
                        onChange={(e) => handleChange(e, "address", "line2")}
                        disabled={isFormDisabled}
                        placeholder="City, State, ZIP"
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-800">
                      {displayedData.address?.line1 ? (
                        <>
                          <div>{displayedData.address.line1}</div>
                          {displayedData.address.line2 && (
                            <div>{displayedData.address.line2}</div>
                          )}
                        </>
                      ) : (
                        'Not provided'
                      )}
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
                  <label htmlFor="gender" className="text-gray-600 text-sm block">
                    Gender
                  </label>
                  {isEdit ? (
                    <select
                      id="gender"
                      value={displayedData.gender || 'Not Selected'}
                      onChange={(e) => handleChange(e, "gender")}
                      disabled={isFormDisabled}
                      className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Not Selected">Not Selected</option>
                    </select>
                  ) : (
                    <span className="text-gray-800 block">
                      {displayedData.gender || 'Not selected'}
                    </span>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={18} className="text-gray-500" />
                <div className="flex-1">
                  <label htmlFor="dob" className="text-gray-600 text-sm block">
                    Date of Birth
                  </label>
                  {isEdit ? (
                    <div>
                      <input
                        id="dob"
                        type="date"
                        value={displayedData.dateOfBirth || ''}
                        onChange={(e) => handleChange(e, "dateOfBirth")}
                        disabled={isFormDisabled}
                        className="w-full border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-blue-500 text-gray-800 disabled:opacity-50"
                        aria-describedby={formErrors.dateOfBirth ? "dob-error" : undefined}
                      />
                      {formErrors.dateOfBirth && (
                        <p id="dob-error" className="text-red-500 text-xs mt-1">
                          {formErrors.dateOfBirth}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 block">
                      {formatDate(displayedData.dateOfBirth)}
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
                    disabled={isFormDisabled}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
  );
};

export default MyProfile;