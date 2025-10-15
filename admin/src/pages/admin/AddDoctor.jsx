import React, { useState, useContext, useEffect } from "react";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";

const getSavedValue = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  }
  return defaultValue;
};

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState(() => getSavedValue("name", ""));
  const [email, setEmail] = useState(() => getSavedValue("email", ""));
  const [password, setPassword] = useState(() => getSavedValue("password", ""));
  const [experience, setExperience] = useState(() =>
    getSavedValue("experience", "1 Year")
  );
  const [fees, setFees] = useState(() => getSavedValue("fees", ""));
  const [speciality, setSpeciality] = useState(() =>
    getSavedValue("speciality", "General physician")
  );
  const [education, setEducation] = useState(() =>
    getSavedValue("education", "")
  );
  const [address1, setAddress1] = useState(() => getSavedValue("address1", ""));
  const [address2, setAddress2] = useState(() => getSavedValue("address2", ""));
  const [about, setAbout] = useState(() => getSavedValue("about", ""));
  const [loading, setLoading] = useState(false);
  const { aToken, backendUrl } = useContext(AdminContext);

  // ✅ Save form data to localStorage whenever fields change
  useEffect(() => {
    localStorage.setItem("name", JSON.stringify(name));
  }, [name]);

  useEffect(() => {
    localStorage.setItem("email", JSON.stringify(email));
  }, [email]);

  useEffect(() => {
    localStorage.setItem("password", JSON.stringify(password));
  }, [password]);

  useEffect(() => {
    localStorage.setItem("experience", JSON.stringify(experience));
  }, [experience]);

  useEffect(() => {
    localStorage.setItem("fees", JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem("speciality", JSON.stringify(speciality));
  }, [speciality]);

  useEffect(() => {
    localStorage.setItem("education", JSON.stringify(education));
  }, [education]);

  useEffect(() => {
    localStorage.setItem("address1", JSON.stringify(address1));
  }, [address1]);

  useEffect(() => {
    localStorage.setItem("address2", JSON.stringify(address2));
  }, [address2]);

  useEffect(() => {
    localStorage.setItem("about", JSON.stringify(about));
  }, [about]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!docImg) {
        toast.error("Image not selected");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", fees);
      formData.append("speciality", speciality);
      formData.append("education", education);
      formData.append("about", about);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            Authorization: aToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        
        localStorage.clear();
        setDocImg(null);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1 Year");
        setFees("");
        setSpeciality("General physician");
        setEducation("");
        setAddress1("");
        setAddress2("");
        setAbout("");
      } else {
        toast.error(data.message);
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto">
        <form onSubmit={onSubmitHandler} className="p-6">
          {/* Image Upload Section */}
          <div className="flex items-center gap-4 mb-6 text-gray-600">
            <label
              htmlFor="doc-img"
              className="cursor-pointer flex items-center gap-3"
            >
              <img
                className="w-16 bg-gray-100 rounded-full hover:opacity-80 transition"
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                alt="upload"
              />
              <div>
                <p className="font-medium text-gray-700">Upload Image</p>
                <p className="text-sm text-gray-400">Click to upload</p>
              </div>
            </label>
            <input
              onChange={(e) => setDocImg(e.target.files[0])}
              type="file"
              id="doc-img"
              hidden
              required
            />
          </div>

          {/* Form Fields - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Doctor Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter doctor name"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Doctor Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter email address"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Doctor Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter password"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Experience</label>
                <select
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1} Year`}>
                      {i + 1} Year{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Speciality</label>
                <select
                  onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General physician">General Physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Education</label>
                <input
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  type="text"
                  placeholder="Enter education details"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Fees</label>
                <input
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  type="number"
                  placeholder="Enter consultation fees"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  type="text"
                  placeholder="Address line 1"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  type="text"
                  placeholder="Address line 2"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* About Section - Full Width */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Write about the doctor's background, expertise, and experience..."
              rows={4}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding Doctor..." : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;