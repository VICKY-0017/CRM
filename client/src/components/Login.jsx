import React, { useState } from 'react';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [loginData, setLoginData] = useState({
    id: "",
    password: "",
    userType: "universe fund"
  });

  const navigate = useNavigate();

  const handlereg = () => {
    navigate("/reg");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Determine the correct key based on userType
    const payload = {
      password: loginData.password,
      userType: loginData.userType,
      ...(loginData.userType === "universe fund"
        ? { universeFundId: loginData.id } // For universe fund users
        : { uniqueId: loginData.id }        // For other user types
      )
    };
  
    try {
      const response = await fetch("https://crm-c8ht.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
  
      const data = await response.json();
      navigate("/dashboard", { state: { user: data.user } }); // Redirect after successful login
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
  };
  
  

  return (
    <div className="dashboard-container">
      <div className="login-card">
        <div className="form-section">
          <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group">
              <label className="input-label">Enter Your ID</label>
              <input
                type="text"
                name="id"
                value={loginData.id}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your ID"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Select Your Role</label>
              <select
                name="userType"
                value={loginData.userType}
                onChange={handleChange}
                className="form-input"
              >
                <option value="universe fund">Universe Fund</option>
                <option value="franchise">Franchise</option>
                <option value="sub-franchise">Sub-Franchise</option>
                <option value="channel-partner">Channel Partner</option>
              </select>
            </div>

            <button type="submit" className="login-button">Login</button>
            <br />
            <br />
            <button type="button" className="login-button" onClick={handlereg}>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
