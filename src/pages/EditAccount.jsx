import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styling/pageStyling/EditAccount.css';

const EditAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    active: true
  });

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeDoc = await getDoc(doc(db, 'clients', id));
        if (!storeDoc.exists()) {
          toast.error('Store not found');
          navigate('/stores');
          return;
        }
        const storeData = storeDoc.data();
        setFormData({
          businessName: storeData.businessName || '',
          contactName: storeData.contactName || '',
          email: storeData.email || '',
          phone: storeData.phone || '',
          address: {
            street: storeData.address?.street || '',
            city: storeData.address?.city || '',
            state: storeData.address?.state || '',
            zip: storeData.address?.zip || ''
          },
          active: storeData.active
        });
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Error loading store data');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const storeRef = doc(db, 'clients', id);
      await updateDoc(storeRef, {
        ...formData,
        updatedAt: new Date()
      });
      toast.success('Store information updated successfully');
      navigate(`/store/${id}`);
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Failed to update store information');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="edit-account">
      <div className="edit-container">
        <button className="close-button" onClick={() => navigate(`/store/${id}`)}>
          <FaTimes />
        </button>
        
        <h1>Edit Store Information</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Business Information</h2>
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="address.zip"
                value={formData.address.zip}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate(`/store/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;
