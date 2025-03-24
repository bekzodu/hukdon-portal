import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaHome, FaStore, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styling/componentStyling/Sidebar.css';

const Sidebar = ({ isSidebarOpen, toggleSidebar, performLogout }) => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast.info(
      <div>
        <p>Are you sure you want to logout?</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <button
            onClick={() => {
              toast.dismiss();
              performLogout();
            }}
            style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: 'logout-confirmation-toast'
      }
    );
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>
      
      <div className="nav-links">
        <button className="nav-btn" onClick={() => navigate('/home')}>
          <FaHome />
          <span className="nav-text">Home</span>
        </button>
        
        <button className="nav-btn" onClick={() => navigate('/stores')}>
          <FaStore />
          <span className="nav-text">Stores</span>
        </button>
        
        <button className="nav-btn">
          <FaEnvelope />
          <span className="nav-text">Messages</span>
        </button>
        
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;