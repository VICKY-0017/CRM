import React, { useState } from "react";
import "../styles/reg.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    userType: "universe fund",
    parentId: "",
    parentType: "", // For channel partners
    channelPartners: [],
    customers: [],
    subFranchises: [],
    directChannelPartners: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear previous messages
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phone.trim()) return "Phone is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    
    // Validate parent ID for roles that require it
    if (formData.userType !== "universe fund" && !formData.parentId) {
      return "Parent ID is required";
    }

    if (formData.parentId && !/^\d+$/.test(formData.parentId)) {
      return "Parent ID must be a number";
    }

    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
        parentId: "",
      });
  
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };


  const renderConditionalFields = () => {
    switch (formData.userType) {
      case "franchise partner":
        return (
          <div className="conditional-section">
            <h3 className="section-title">Franchise Partner Details</h3>
            <div className="relationship-info">
              As a Franchise Partner, you can:
              <ul>
                <li>Manage Channel Partners under you</li>
                <li>View customers under your Channel Partners</li>
              </ul>
            </div>
            <div className="input-group">
              <label htmlFor="parentId" className="input-label">
                Universe Fund ID
              </label>
              <input
                type="text"
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your Universe Fund ID"
                required
              />
            </div>
          </div>
        );

      case "sub franchise partner":
        return (
          <div className="conditional-section">
            <h3 className="section-title">Sub-Franchise Partner Details</h3>
            <div className="relationship-info">
              As a Sub-Franchise Partner, you can:
              <ul>
                <li>Manage Channel Partners assigned to you</li>
                <li>View customers under your Channel Partners</li>
              </ul>
            </div>
            <div className="input-group">
              <label htmlFor="franchiseId" className="input-label">
                Franchise Partner ID
              </label>
              <input
                type="text"
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your Franchise Partner ID"
                required
              />
            </div>
          </div>
        );

      case "channel partner":
        return (
          <div className="conditional-section">
            <h3 className="section-title">Channel Partner Details</h3>
            <div className="relationship-info">
              As a Channel Partner, you will:
              <ul>
                <li>Manage your customer base</li>
                <li>Report to your assigned partner</li>
              </ul>
            </div>
            <div className="input-group">
              <label htmlFor="parentType" className="input-label">
                Partner Type
              </label>
              <select
                id="parentType"
                name="parentType"
                value={formData.parentType}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                <option value="">Select your parent partner type</option>
                <option value="universe">Universe Fund</option>
                <option value="franchise">Franchise Partner</option>
                <option value="sub_franchise">Sub-Franchise Partner</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="parentId" className="input-label">
                Parent Partner ID
              </label>
              <input
                type="text"
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your parent partner's ID"
                required
              />
            </div>
          </div>
        );

      case "universe fund":
        return (
          <div className="conditional-section">
            <h3 className="section-title">Universe Fund Administrator</h3>
            <div className="relationship-info">
              As a Universe Fund administrator, you can:
              <ul>
                <li>Manage Sub-Franchises</li>
                <li>Manage direct Channel Partners</li>
                <li>View all customer relationships</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-container">
      <div className="form-card">
        <h1 className="form-title">Registration Form</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="input-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone" className="input-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email ID
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email ID"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Set a new password"
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label htmlFor="userType" className="input-label">
              Select Role
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-input form-select"
            >
              <option value="universe fund">Universe Fund</option>
              <option value="franchise partner">Franchise Partner</option>
              <option value="sub franchise partner">Sub Franchise Partner</option>
              <option value="channel partner">Channel Partner</option>
              <option value="company">Company</option>
            </select>
          </div>

          {renderConditionalFields()}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;