import React, { useState } from "react";
import "../styles/reg.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    userType: "universe fund",
    uniqueId: "", // Unique ID for the role
    parentId: "",
    parentType: "",
    universeFundId: "", // For universe fund ID
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
  
    // Validate uniqueId, parentId, and parentType for non-universe fund roles
    if (formData.userType !== "universe fund") {
      if (!formData.uniqueId) return "Unique ID is required";
      if (!formData.parentId) return "Parent ID is required";
      // if (!/^\d+$/.test(formData.parentId)) return "Parent ID must be a number";
  
      if (!formData.parentType) return "Parent Type is required";
    } else {
      // Validate universeFundId for universe fund role
      if (!formData.universeFundId.trim()) return "Universe Fund ID is required";
    }
  
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form fields
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    // Ensure phone number is not empty
    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }
  
    // Map userType to role
    const formDataWithRole = {
      ...formData,
      role: formData.userType,  // Map userType to role
      parentType: formData.userType === 'universe fund' ? null : formData.parentType, // Set parentType to null for universe fund
      parentId: formData.userType === 'universe fund' ? null : formData.parentId, // Set parentId to null for universe fund
      uniqueId: formData.userType === 'universe fund' ? null : formData.uniqueId, // Set uniqueId to null for universe fund
      universeFundId: formData.userType === 'universe fund' ? formData.universeFundId : undefined // Only send universeFundId if role is 'universe fund'
    };
  
    setLoading(true);
  
    try {
      const response = await fetch("https://crm-c8ht.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataWithRole),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
  
      setSuccess("Registration successful! You can now login.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        userType: "universe fund",
        uniqueId: "",
        parentId: "",
        parentType: "",
        universeFundId: "", // Reset universe fund ID
      });
  
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const renderConditionalFields = () => {
    if (formData.userType !== "universe fund") {
      return (
        <div className="conditional-section">
          <h3 className="section-title">Role Details</h3>
  
          <div className="form-group">
            <label className="form-label">Unique ID</label>
            <input
              type="text"
              name="uniqueId"
              value={formData.uniqueId}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your unique ID"
              required
            />
          </div>
  
          <div className="form-group">
            <label className="form-label">Parent ID</label>
            <input
              type="text"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter Parent ID"
              required
            />
          </div>
  
          <div className="form-group">
            <label className="form-label">Parent Type</label>
            <select
              name="parentType"
              value={formData.parentType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Parent Type</option>
              <option value="universe fund">Universe Fund</option>
              <option value="channel-partner">Channel Partner</option>
              <option value="franchise">Franchise</option>
              <option value="sub-franchise">Sub-Franchise</option>
            </select>
          </div>
        </div>
      );
    }
  
    if (formData.userType === "universe fund") {
      return (
        <div className="conditional-section">
          <h3 className="section-title">Universe Fund Details</h3>
          <div className="form-group">
            <label className="form-label">Universe Fund ID</label>
            <input
              type="text"
              name="universeFundId"
              value={formData.universeFundId}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter Universe Fund ID"
              required
            />
          </div>
        </div>
      );
    }
  
    return null;
  };
  
  

  return (
    <div className="registration-container">
      <div className="form-wrapper">
        <div className="form-card">
          <h1 className="form-title">Registration Form</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email ID"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Set a new password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Role
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="universe fund">Universe Fund</option>
                <option value="franchise">Franchise</option>
                <option value="sub-franchise">Sub-Franchise</option>
                <option value="channel-partner">Channel Partner</option>
              </select>
            </div>

            {renderConditionalFields()}

            <button 
              type="submit" 
              className={`submit-button ${loading ? 'button-loading' : ''}`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
