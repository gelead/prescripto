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
    <form onSubmit={onSubmitHandler} className="m-5 w-full flex justify-center">
      <div className="bg-white px-6 py-6 border border-gray-200 rounded-2xl shadow-sm w-full max-w-4xl">
        <p className="mb-6 text-xl font-semibold text-gray-800">Add Doctor</p>

        <div className="flex items-center gap-4 mb-8 text-gray-600">
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
          />
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-700">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div>
              <p>Doctor Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Name"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <p>Doctor Email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <p>Doctor Password</p>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border border-gray-300 rounded px-3 py-2"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={`${i + 1} Year`}>
                    {i + 1} Year
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p>Fees</p>
              <input
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                type="number"
                placeholder="Fees"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div>
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div>
              <p>Education</p>
              <input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                type="text"
                placeholder="Education"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <p>Address</p>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                type="text"
                placeholder="Address 1"
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                type="text"
                placeholder="Address 2"
                required
                className="border border-gray-300 rounded px-3 py-2 mt-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 mb-2">
          <p>About</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write about yourself"
            rows={5}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full"
          ></textarea>
        </div>

        <button
          type="submit"
          className="mt-8 bg-primary cursor-pointer text-white px-10 py-3 rounded-full"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
