import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../styling/pageStyling/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({
        message: 'Password reset email sent successfully! Please check your inbox and spam folder.',
        type: 'success'
      });
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      setStatus({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1 className="forgot-title">Reset Password</h1>
        
        {!isSubmitted ? (
          <>
            <p className="forgot-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleResetPassword} className="forgot-form">
              <div className="forgot-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="forgot-input"
                  required
                />
              </div>
              <button type="submit" className="forgot-submit-btn">
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-result">
            <div className={`forgot-message ${status.type}`}>
              {status.message}
            </div>
            {status.type === 'error' && (
              <button
                className="forgot-back-btn"
                onClick={() => setIsSubmitted(false)}
              >
                Try Again
              </button>
            )}
          </div>
        )}
        
        <button
          type="button"
          className="forgot-back-btn"
          onClick={() => navigate('/')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
