import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FaSearch } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { useStores } from '../context/StoresContext';
import '../styling/pageStyling/StoresPage.css';
import placeholderImage from '../assets/placeholder-store.png';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { storesCache, updateStoresCache, isCacheValid } = useStores();

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
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have valid cached data
        if (isCacheValid()) {
          setStores(storesCache.data);
          setIsLoading(false);
          return;
        }

        // If no valid cache, fetch from Firestore
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const storeData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update both local state and cache
        setStores(storeData);
        updateStoresCache(storeData);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [isCacheValid, storesCache.data, updateStoresCache]);

  const filteredStores = stores.filter(store =>
    store.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stores-container">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        performLogout={performLogout}
      />
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="stores-grid">
            {filteredStores.map(store => (
              <div
                key={store.id}
                className="store-card"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <img
                  src={store.imageUrl || placeholderImage}
                  alt={store.businessName}
                  className="store-image"
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
                <h3 className="store-name">{store.businessName}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
