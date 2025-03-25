import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaTimes, FaPlus, FaTrash, FaGift, FaPen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../styling/pageStyling/ManageRewards.css';

const ManageRewards = () => {
  const [store, setStore] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(-1);
  const { id } = useParams();
  const navigate = useNavigate();

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

        const storeData = storeDoc.data();
        setStore(storeData);
        
        // Convert rewardThresholds map to array for easier manipulation
        const rewardThresholdsMap = storeData.rewardThresholds || {};
        const rewardArray = Object.entries(rewardThresholdsMap).map(([checkIns, reward]) => ({
          checkIns: parseInt(checkIns),
          reward,
          isEditing: false
        }));
        
        // Sort by number of check-ins
        rewardArray.sort((a, b) => a.checkIns - b.checkIns);
        setRewards(rewardArray);
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Error loading store data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const addNewReward = () => {
    setRewards([...rewards, { checkIns: '', reward: '', isEditing: true }]);
    setEditingIndex(rewards.length);
  };

  const updateReward = (index, field, value) => {
    if (rewards[index].isEditing || editingIndex === index) {
      const updatedRewards = [...rewards];
      updatedRewards[index] = {
        ...updatedRewards[index],
        [field]: field === 'checkIns' ? (value === '' ? '' : parseInt(value)) : value
      };
      setRewards(updatedRewards);
    }
  };

  const removeReward = (index) => {
    const updatedRewards = rewards.filter((_, i) => i !== index);
    setRewards(updatedRewards);
    if (editingIndex === index) {
      setEditingIndex(-1);
    }
  };

  const toggleEditMode = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async () => {
    // Validate rewards
    const invalidRewards = rewards.some(reward => 
      reward.checkIns === '' || 
      reward.reward === '' || 
      isNaN(reward.checkIns) || 
      reward.checkIns < 1
    );

    if (invalidRewards) {
      toast.error('Please fill in all reward fields correctly. Check-ins must be positive numbers.');
      return;
    }

    // Check for duplicate check-in numbers
    const checkInNumbers = rewards.map(r => r.checkIns);
    if (new Set(checkInNumbers).size !== checkInNumbers.length) {
      toast.error('Duplicate check-in numbers are not allowed');
      return;
    }

    try {
      // Convert rewards array to map
      const rewardThresholds = rewards.reduce((acc, { checkIns, reward }) => {
        acc[checkIns] = reward;
        return acc;
      }, {});

      await updateDoc(doc(db, 'clients', id), {
        rewardThresholds
      });

      // Update all rewards to non-editing mode
      const updatedRewards = rewards.map(reward => ({
        ...reward,
        isEditing: false
      }));
      setRewards(updatedRewards);
      setEditingIndex(-1);

      toast.success('Rewards updated successfully!');
    } catch (error) {
      console.error('Error updating rewards:', error);
      toast.error('Failed to update rewards');
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (!store) return <div className="error-message">Store not found</div>;

  return (
    <div className="manage-rewards-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="rewards-header">
          <button className="close-button" onClick={() => navigate(`/store/${id}`)}>
            <FaTimes />
          </button>
          <div className="store-info">
            <h1><FaGift /> Rewards Console</h1>
            <div className="store-details">
              <span className="store-name">{store.businessName}</span>
              <span className="store-id">ID: {id}</span>
            </div>
          </div>
        </div>

        <div className="rewards-content">
          <div className="rewards-list">
            {rewards.map((reward, index) => (
              <div key={index} className="reward-item">
                <div className="reward-inputs">
                  <div className="input-group">
                    <label>Check-ins Required:</label>
                    {editingIndex === index ? (
                      <input
                        type="number"
                        min="1"
                        value={reward.checkIns}
                        onChange={(e) => updateReward(index, 'checkIns', e.target.value)}
                        placeholder="Number of check-ins"
                      />
                    ) : (
                      <div className="reward-value">{reward.checkIns} check-ins</div>
                    )}
                  </div>
                  <div className="input-group">
                    <label>Reward:</label>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={reward.reward}
                        onChange={(e) => updateReward(index, 'reward', e.target.value)}
                        placeholder="e.g., '10% OFF' or 'Free Drink'"
                      />
                    ) : (
                      <div className="reward-value">{reward.reward}</div>
                    )}
                  </div>
                </div>
                <div className="reward-actions">
                  {editingIndex === index ? (
                    <button 
                      className="remove-reward-button"
                      onClick={() => removeReward(index)}
                    >
                      <FaTrash />
                    </button>
                  ) : (
                    <button 
                      className="edit-reward-button"
                      onClick={() => toggleEditMode(index)}
                    >
                      <FaPen />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button className="add-reward-button" onClick={addNewReward}>
              <FaPlus /> Add New Reward
            </button>
          </div>

          <button 
            className="save-rewards-button"
            onClick={handleSave}
            disabled={rewards.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageRewards;
