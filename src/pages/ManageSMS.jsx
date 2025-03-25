import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaPaperPlane, FaClock, FaTimes, FaPhone } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../styling/pageStyling/ManageSMS.css';

const ManageSMS = () => {
  const [store, setStore] = useState(null);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const performLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      toast.error('Error logging out. Please try again.');
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        const storeDoc = await getDoc(doc(db, 'clients', id));
        
        if (!storeDoc.exists()) {
          toast.error('Store not found');
          navigate('/stores');
          return;
        }

        setStore(storeDoc.data());
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Error loading store data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (isScheduleMode && !scheduledTime) {
      toast.error('Please select a time to schedule the message');
      return;
    }

    try {
      if (isScheduleMode) {
        toast.success('Message scheduled successfully!');
        setScheduledTime('');
      } else {
        toast.success('Message sent successfully!');
      }
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to ${isScheduleMode ? 'schedule' : 'send'} message`);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (!store) return <div className="error-message">Store not found</div>;

  return (
    <div className="manage-sms-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        performLogout={performLogout}
      />
      
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="sms-header">
          <button className="close-button" onClick={() => navigate(`/store/${id}`)}>
            <FaTimes />
          </button>
          <div className="store-info">
            <h1>📲 SMS Console</h1>
            <div className="store-details">
              <span className="store-name">{store.businessName}</span>
              <span className="store-id">ID: {id}</span>
              <div className="store-phone">
                <FaPhone /> {store.phone}
              </div>
            </div>
          </div>
        </div>

        <div className="sms-content">
          <div className="message-input-section">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              maxLength={160}
              className="message-input"
            />
            <div className="message-actions">
              <div className="character-count">
                {message.length}/160 characters
              </div>
              <div className="action-buttons">
                <div className="schedule-toggle-container">
                  <span className="schedule-label">
                    <FaClock /> Schedule
                  </span>
                  <button 
                    className={`toggle-switch ${isScheduleMode ? 'active' : ''}`}
                    onClick={() => setIsScheduleMode(!isScheduleMode)}
                    role="switch"
                    aria-checked={isScheduleMode}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
                {isScheduleMode && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="schedule-time-input"
                  />
                )}
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                >
                  <FaPaperPlane /> {isScheduleMode ? 'Schedule Send' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h2>Message Preview</h2>
            <div className="preview-container">
              <div className="preview-iphone">
                <div className="iphone-frame">
                  <div className="message-bubble">
                    {message || 'Your message will appear here...'}
                  </div>
                </div>
              </div>
              <div className="preview-android">
                <div className="android-frame">
                  <div className="android-header">
                    <div className="android-contact">
                      <div className="android-avatar"></div>
                      <div className="android-name">{store.businessName}</div>
                    </div>
                  </div>
                  <div className="message-bubble">
                    {message || 'Your message will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSMS;
