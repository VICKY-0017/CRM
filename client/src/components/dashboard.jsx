import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Phone, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';
import '../styles/dashbord.css';

const Dashboard = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [subordinates, setSubordinates] = useState([]);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.userType, user.id);
    }
  }, [user]);

  const fetchDashboardData = async (userType, id) => {
    try {
      const response = await fetch(`https://crm-c8ht.onrender.com/dashboard/${userType}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setSubordinates(data);
      calculateInsights(data);
      setError(null);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message);
      setSubordinates([]);
    }
  };

  const calculateInsights = (data) => {
    const totalSubordinates = data.length;
    const parentTypes = data.reduce((acc, curr) => {
      acc[curr.parentType] = (acc[curr.parentType] || 0) + 1;
      return acc;
    }, {});

    setInsights({
      totalSubordinates,
      parentTypes,
      chartData: Object.entries(parentTypes).map(([type, count]) => ({
        name: type,
        count
      }))
    });
  };

  if (!user) {
    return (
      <div className="login-prompt">
        <div className="card">
          <div className="card-content center-content">
            <AlertCircle className="warning-icon" />
            <p className="login-message">Please log in to view the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h2 className="dashboard-title">
          Welcome to Your Dashboard
        </h2>

        {/* User Info Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserCheck className="icon icon-blue" />
              <span>User Information</span>
            </h3>
          </div>
          <div className="card-content">
            <div className="user-info-grid">
              <div className="user-info-item">
                <Users className="icon icon-gray" />
                <div>
                  <p className="label">Name</p>
                  <p className="value">{user.name}</p>
                </div>
              </div>
              <div className="user-info-item">
                <TrendingUp className="icon icon-gray" />
                <div>
                  <p className="label">Role</p>
                  <p className="value">{user.userType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="card error-card">
            <div className="card-content">
              <p className="error-message">
                <AlertCircle className="icon" />
                {error}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Insights Section */}
            {insights && (
              <div className="insights-grid">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Distribution by Parent Type</h3>
                  </div>
                  <div className="card-content chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insights.chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Quick Stats</h3>
                  </div>
                  <div className="card-content">
                    <div className="stats-container">
                      <div className="stat-card primary">
                        <p className="stat-label">Total Subordinates</p>
                        <p className="stat-value">{insights.totalSubordinates}</p>
                      </div>
                      {Object.entries(insights.parentTypes).map(([type, count]) => (
                        <div key={type} className="stat-card">
                          <p className="stat-label">{type}</p>
                          <p className="stat-value">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subordinates List */}
            {subordinates.length > 0 ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <Users className="icon icon-blue" />
                    Subordinates Directory
                  </h3>
                </div>
                <div className="card-content">
                  <div className="subordinates-grid">
                    {subordinates.map((subordinate) => (
                      <div key={subordinate.id} className="subordinate-card">
                        <div className="subordinate-info">
                          <div className="info-row">
                            <UserCheck className="icon icon-blue" />
                            <p className="name">{subordinate.name}</p>
                          </div>
                          <div className="info-row">
                            <Phone className="icon icon-gray" />
                            <p className="phone">{subordinate.phone}</p>
                          </div>
                          <p className="detail">ID: {subordinate.uniqueId}</p>
                          <p className="detail">Type: {subordinate.parentType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-content empty-state">
                  <Users className="icon icon-gray" />
                  <p>No subordinates found for this user.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
