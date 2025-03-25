import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../config/firebase';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaClock, FaCalendarAlt, FaPen } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import placeholderImage from '../assets/placeholder-store.png';
import '../styling/pageStyling/StoreExpanded.css';

const StoreExpanded = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Create a reference to the storage location
      const storageRef = ref(storage, `store-images/${id}/${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore document with new image URL
      const storeRef = doc(db, 'clients', id);
      await updateDoc(storeRef, {
        imageUrl: downloadURL
      });

      // Update local state
      setStore(prev => ({
        ...prev,
        imageUrl: downloadURL
      }));

      toast.success('Image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        // Fetch main store document
        const storeDoc = await getDoc(doc(db, 'clients', id));
        
        if (!storeDoc.exists()) {
          setError('Store not found');
          return;
        }

        // Fetch store hours
        const hoursCollection = collection(db, 'clients', id, 'hours');
        const hoursSnapshot = await getDocs(hoursCollection);
        const hoursData = {};
        hoursSnapshot.forEach(doc => {
          hoursData[doc.id] = doc.data();
        });

        // Fetch store reviews
        const reviewsCollection = collection(db, 'reviews');
        const reviewsQuery = query(reviewsCollection, where('storeId', '==', id));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = [];
        reviewsSnapshot.forEach(doc => {
          reviewsData.push({ id: doc.id, ...doc.data() });
        });

        // Combine all data
        const storeData = {
          id: storeDoc.id,
          ...storeDoc.data(),
          hours: hoursData,
          reviews: reviewsData,
        };

        setStore(storeData);
      } catch (error) {
        console.error('Error fetching store data:', error);
        setError('Error loading store data');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id]);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!store) return <div className="error-message">Store not found</div>;

  return (
    <div className="store-expanded-page">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        performLogout={performLogout}
      />
      
      <div className={`store-expanded-main-content ${isSidebarOpen ? 'store-expanded-shifted' : ''}`}>
        <button className="store-expanded-close-button" onClick={() => navigate('/stores')}>
          <FaTimes />
        </button>
        
        <div className="store-expanded-content">
          <div className="store-expanded-header">
            <div className="store-expanded-image-container">
              <img
                src={store.imageUrl || placeholderImage}
                alt={store.businessName}
                className="store-expanded-banner"
              />
              <label className="store-expanded-image-upload-label" htmlFor="imageUpload">
                <FaPen />
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {uploading && <div className="store-expanded-upload-overlay">Uploading...</div>}
            </div>
            <h1>{store.businessName}</h1>
            
            <div className="store-expanded-actions">
              <button 
                className="store-expanded-action-button store-expanded-edit-button"
                onClick={() => navigate(`/stores/${id}/edit`)}
              >
                Edit Information
              </button>
              <button 
                className="store-expanded-action-button store-expanded-sms-button"
                onClick={() => navigate(`/stores/${id}/sms`)}
              >
                Manage SMS
              </button>
              <button 
                className="store-expanded-action-button store-expanded-rewards-button"
                onClick={() => navigate(`/stores/${id}/rewards`)}
              >
                Manage Rewards
              </button>
            </div>
          </div>

          <div className="store-expanded-details">
            <div className="store-expanded-detail-section contact-info">
              <h2><FaUser /> Business Information</h2>
              <p><strong>Business Name:</strong> {store.businessName}</p>
              <p><strong>Contact Name:</strong> {store.contactName}</p>
              <p><strong>Created:</strong> {store.createdAt?.toDate().toLocaleDateString()}</p>
              <p><strong>Status:</strong> {store.active ? 'Active' : 'Inactive'}</p>
            </div>

            <div className="store-expanded-detail-section contact-info">
              <h2><FaEnvelope /> Contact Information</h2>
              <p><FaEnvelope /> {store.email}</p>
              <p><FaPhone /> {store.phone}</p>
            </div>

            <div className="store-expanded-detail-section location">
              <h2><FaMapMarkerAlt /> Location</h2>
              <p><strong>Street:</strong> {store.address?.street}</p>
              <p><strong>City:</strong> {store.address?.city}</p>
              <p><strong>State:</strong> {store.address?.state}</p>
              <p><strong>ZIP:</strong> {store.address?.zip}</p>
            </div>

            {store.twilioStatus && (
              <div className="store-expanded-detail-section">
                <h2>Twilio Information</h2>
                <p><strong>Status:</strong> {store.twilioStatus}</p>
                {store.twilioNumber && (
                  <p><strong>Number:</strong> {store.twilioNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreExpanded;
