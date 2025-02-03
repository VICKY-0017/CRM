import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Users,
  Phone,
  UserCheck,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Layout,
  Menu,
  X
} from 'lucide-react';
import '../styles/dashbord.css'; // Ensure this path matches your file structure

// HierarchyNode Component
const HierarchyNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="hierarchy-node" style={{ marginLeft: `${level * 20}px` }}>
      <div className="node-header" onClick={() => setIsExpanded(!isExpanded)}>
        {hasChildren && (
          <span className="expand-icon">
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </span>
        )}
        <div className="node-content">
          <div className="node-left">
            <div className="node-title">
              <UserCheck className="icon icon-blue" />
              <span>{node.name} ({node.userType})</span>
            </div>
            <div className="node-details">
              <Phone className="icon icon-gray" />
              <span>{node.phone}</span>
            </div>
          </div>
          <div className="node-right">
            <span className="id-tag">
              ID: {node.userType === 'universe fund' ? 'universe fund' : node.uniqueId}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="children-container">
          {node.children.map((child) => (
            <HierarchyNode key={child.uniqueId} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [hierarchyData, setHierarchyData] = useState(null);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (user) {
      fetchHierarchyData(user.userType, user.id);
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const calculateInsights = (data) => {
    if (!data) return null;

    const countUserTypes = (node, counts = {}) => {
      counts[node.userType] = (counts[node.userType] || 0) + 1;
      if (node.children) {
        node.children.forEach((child) => countUserTypes(child, counts));
      }
      return counts;
    };

    const userTypeCounts = countUserTypes(data);
    const total = Object.values(userTypeCounts).reduce((a, b) => a + b, 0);

    return {
      totalMembers: total,
      distribution: Object.entries(userTypeCounts).map(([type, count]) => ({
        name: type,
        value: count,
        percentage: ((count / total) * 100).toFixed(1),
      })),
      hierarchyDepth: getHierarchyDepth(data),
    };
  };

  const getHierarchyDepth = (node, depth = 0) => {
    if (!node.children || node.children.length === 0) return depth;
    return Math.max(
      ...node.children.map((child) => getHierarchyDepth(child, depth + 1))
    );
  };

  const fetchHierarchyData = async (userType, id) => {
    try {
      const response = await fetch(
        `https://crm-c8ht.onrender.com/dashboard/${userType}/${id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setHierarchyData(data);
      setInsights(calculateInsights(data));
      setError(null);
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message);
    }
  };

  const COLORS = ['#4169e1', '#9370db', '#fa8072', '#64b5f6'];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    if (windowWidth <= 768) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="pie-chart-legend">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: entry.color }}></span>
            <span className="legend-text">
              {entry.payload.name}: {entry.payload.percentage}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (!user) {
    return (
      <div className="login-prompt">
        <AlertCircle className="warning-icon" />
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Organization Dashboard</h1>
          <button className="mobile-nav-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Main Layout */}
        <div className="dashboard-layout">
          {/* Sidebar Overlay */}
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <aside className={`dashboard-sidebar ${isSidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-content">
              <div className="user-card">
                <h2>Current User</h2>
                <div className="user-info">
                  <UserCheck className="icon icon-blue" />
                  <span>{user.name}</span>
                  <span className="user-type">{user.userType}</span>
                </div>
              </div>
              {insights && (
                <div className="quick-stats">
                  <div className="stat-item">
                    <Users className="icon icon-blue" />
                    <div className="stat-content">
                      <span className="stat-label">Total Members</span>
                      <span className="stat-value">{insights.totalMembers}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <TrendingUp className="icon icon-purple" />
                    <div className="stat-content">
                      <span className="stat-label">Hierarchy Levels</span>
                      <span className="stat-value">{insights.hierarchyDepth + 1}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="main-content">
              {insights && (
                <section className="insights-section">
                  <h2>Role Distribution</h2>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={insights.distribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={windowWidth <= 768 ? "60%" : "80%"}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {insights.distribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        {windowWidth <= 768 && (
                          <Legend
                            content={renderLegend}
                            verticalAlign="bottom"
                            align="center"
                          />
                        )}
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
              {error ? (
                <div className="error-card">
                  <AlertCircle className="icon" />
                  <p>{error}</p>
                </div>
              ) : hierarchyData ? (
                <section className="hierarchy-section">
                  <h2>Organization Hierarchy</h2>
                  <div className="hierarchy-scroll">
                    <HierarchyNode node={hierarchyData} />
                  </div>
                </section>
              ) : (
                <div className="loading">Loading hierarchy data...</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
