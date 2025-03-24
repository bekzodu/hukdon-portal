import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaImage } from 'react-icons/fa';
import '../styling/pageStyling/CreateAccountPage.css';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const patterns = {
    name: /^[a-zA-Z\s'-]+$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\(\d{3}\) \d{3}-\d{4}$/,
    zip: /^\d{5}(-\d{4})?$/
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value && !patterns.name.test(value)) {
          error = 'Only letters, spaces, hyphens, and apostrophes allowed';
        }
        formattedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;

      case 'phone':
        formattedValue = formatPhoneNumber(value);
        if (value && !patterns.phone.test(formattedValue) && value.replace(/[^\d]/g, '').length === 10) {
          error = 'Please enter a valid 10-digit phone number';
        }
        break;

      case 'email':
        if (value && !patterns.email.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'zip':
        formattedValue = value.replace(/[^\d-]/g, '');
        if (value && !patterns.zip.test(formattedValue)) {
          error = 'Please enter a valid ZIP code';
        }
        break;

      case 'state':
        formattedValue = value.toUpperCase().slice(0, 2);
        break;

      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!patterns.name.test(formData.firstName)) {
      errors.firstName = 'Please enter a valid first name';
    }
    if (!patterns.name.test(formData.lastName)) {
      errors.lastName = 'Please enter a valid last name';
    }

    if (!patterns.email.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!patterns.phone.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!patterns.zip.test(formData.zip)) {
      errors.zip = 'Please enter a valid ZIP code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let imageUrl = '';
      if (selectedImage) {
        const storageRef = ref(storage, `store-images/${userCredential.user.uid}/${selectedImage.name}`);
        await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      const clientData = {
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
        contactName: `${formData.firstName} ${formData.lastName}`,
        twilioNumber: '',
        twilioStatus: 'none',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rewardThresholds: {},
        imageUrl: imageUrl
      };

      await setDoc(doc(db, 'clients', userCredential.user.uid), clientData);
      navigate('/home');
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasFormData = () => {
    return Object.values(formData).some(value => value !== '');
  };

  const handleBack = () => {
    if (hasFormData()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        navigate('/home');
      }
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="create-account-container">
      <button 
        onClick={handleBack}
        className="back-button"
      >
        ←
      </button>
      <div className="create-account-card">
        <h1 className="create-account-title">Register New Client</h1>
        {error && <p className="create-account-error">{error}</p>}
        
        <form onSubmit={handleSubmit} className="create-account-form">
          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="name-fields-container">
              <div className="name-field">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className={formErrors.firstName ? 'error' : ''}
                />
                {formErrors.firstName && (
                  <span className="error-message">{formErrors.firstName}</span>
                )}
              </div>
              <div className="name-field">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className={formErrors.lastName ? 'error' : ''}
                />
                {formErrors.lastName && (
                  <span className="error-message">{formErrors.lastName}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(XXX) XXX-XXXX"
                required
                className={formErrors.phone ? 'error' : ''}
                maxLength="14"
              />
              {formErrors.phone && (
                <span className="error-message">{formErrors.phone}</span>
              )}
            </div>
            
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  required
                  minLength="6"
                  className={formErrors.password ? 'error' : ''}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🔒' : '👁️'}
                </button>
              </div>
              {formErrors.password && (
                <span className="error-message">{formErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  minLength="6"
                  className={formErrors.confirmPassword ? 'error' : ''}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🔒' : '👁️'}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <span className="error-message">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Business Information</h2>
            
            <div className="image-upload-section">
              <label htmlFor="storeImage" className="image-upload-box">
                {imagePreview ? (
                  <img src={imagePreview} alt="Store preview" className="image-preview" />
                ) : (
                  <>
                    <FaImage className="upload-icon" />
                    <span>Upload Store Image</span>
                    <span className="optional-text">(Optional)</span>
                  </>
                )}
              </label>
              <input
                type="file"
                id="storeImage"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Business Name"
                required
                className={formErrors.businessName ? 'error' : ''}
              />
              {formErrors.businessName && (
                <span className="error-message">{formErrors.businessName}</span>
              )}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street Address"
                required
                className={formErrors.street ? 'error' : ''}
              />
              {formErrors.street && (
                <span className="error-message">{formErrors.street}</span>
              )}
            </div>
            
            <div className="form-row city-state">
              <div className="form-group">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className={formErrors.city ? 'error' : ''}
                />
                {formErrors.city && (
                  <span className="error-message">{formErrors.city}</span>
                )}
              </div>
              <div className="form-group">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className={formErrors.state ? 'error' : ''}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <span className="error-message">{formErrors.state}</span>
                )}
              </div>
            </div>
            <div className="form-row zip">
              <div className="form-group">
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  required
                  className={formErrors.zip ? 'error' : ''}
                />
                {formErrors.zip && (
                  <span className="error-message">{formErrors.zip}</span>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="create-account-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Client'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;
