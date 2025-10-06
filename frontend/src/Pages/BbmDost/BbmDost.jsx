import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";
import { addBbmDost } from "../../utils/supabaseApi"; // ✅ Make sure path is correct

// ✅ FIX: Keep outside component to prevent re-creation on every render
const initialFormState = {
  name: "",
  phone_no: "",
  email: "",
  role: "Customer", // Default role
  // Customer fields
  pincode: "",
  district: "",
  state: "",
  // Vendor fields
  organization_name: "",
  gst_no: "",
};

const RoleBasedRegistrationForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Handle form field input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle role change (reset role-specific fields)
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      // Reset unused fields
      pincode: "",
      district: "",
      state: "",
      organization_name: "",
      gst_no: "",
    }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      // Send data to backend
      const response = await addBbmDost(formData);

      if (response.error) {
        throw new Error(response.error.message || "Failed to add BBM Dost");
      }

      setSubmissionStatus("success");
      setFormData(initialFormState); // Reset form after success
    } catch (error) {
      console.error("Failed to submit form:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register as BBM Dost
        </h2>

        {/* Name */}
        <div className="flex items-center mb-4 border-b border-gray-300">
          <User className="text-gray-500 mr-2" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full p-2 outline-none"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex items-center mb-4 border-b border-gray-300">
          <Phone className="text-gray-500 mr-2" />
          <input
            type="text"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="w-full p-2 outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center mb-4 border-b border-gray-300">
          <Mail className="text-gray-500 mr-2" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className="w-full p-2 outline-none"
            required
          />
        </div>

        {/* Role Dropdown */}
        <div className="flex items-center mb-4 border-b border-gray-300">
          <Briefcase className="text-gray-500 mr-2" />
          <select
            name="role"
            value={formData.role}
            onChange={handleRoleChange}
            className="w-full p-2 outline-none"
          >
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>
        </div>

        {/* Customer Fields */}
        {formData.role === "Customer" && (
          <>
            <div className="flex items-center mb-4 border-b border-gray-300">
              <MapPin className="text-gray-500 mr-2" />
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                className="w-full p-2 outline-none"
                required
              />
            </div>

            <div className="flex items-center mb-4 border-b border-gray-300">
              <Building className="text-gray-500 mr-2" />
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="District"
                className="w-full p-2 outline-none"
                required
              />
            </div>

            <div className="flex items-center mb-4 border-b border-gray-300">
              <Building className="text-gray-500 mr-2" />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className="w-full p-2 outline-none"
                required
              />
            </div>
          </>
        )}

        {/* Vendor Fields */}
        {formData.role === "Vendor" && (
          <>
            <div className="flex items-center mb-4 border-b border-gray-300">
              <Building className="text-gray-500 mr-2" />
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder="Organization Name"
                className="w-full p-2 outline-none"
                required
              />
            </div>

            <div className="flex items-center mb-4 border-b border-gray-300">
              <Building className="text-gray-500 mr-2" />
              <input
                type="text"
                name="gst_no"
                value={formData.gst_no}
                onChange={handleInputChange}
                placeholder="GST Number"
                className="w-full p-2 outline-none"
                required
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {/* Status Message */}
        {submissionStatus === "success" && (
          <p className="text-green-600 mt-3 text-center">Submitted successfully!</p>
        )}
        {submissionStatus === "error" && (
          <p className="text-red-600 mt-3 text-center">Submission failed. Try again.</p>
        )}
      </form>
    </div>
  );
};

export default RoleBasedRegistrationForm;
