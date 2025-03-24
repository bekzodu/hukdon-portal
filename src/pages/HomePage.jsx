import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { FaBars, FaHome, FaStore, FaEnvelope, FaSignOutAlt, FaUserPlus, FaUserEdit } from 'react-icons/fa';
import '../styling/pageStyling/HomePage.css';
import StatsChart from '../components/StatsChart';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';

const HomePage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const performLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      toast.error('Error logging out. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="home-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        performLogout={performLogout}
      />
      
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <h1 className="dashboard-title">Dashboard</h1>
        
        <div className="dashboard-content">
          <StatsChart />
          
          <div className="action-blocks">
            <div className="action-block" onClick={() => navigate('/create-account')}>
              <FaUserPlus className="action-icon" />
              <h3>Create New Account</h3>
              <p>Add a new user account to the system</p>
            </div>
            
            <div className="action-block" onClick={() => navigate('/modify-account')}>
              <FaUserEdit className="action-icon" />
              <h3>Modify Existing Account</h3>
              <p>Update or modify existing user accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
